package com.renbobridal.module.order.service;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.module.auth.entity.User;
import com.renbobridal.module.auth.repository.UserRepository;
import com.renbobridal.module.order.dto.OrderDto;
import com.renbobridal.module.order.dto.OrderRequest;
import com.renbobridal.module.order.entity.Order;
import com.renbobridal.module.order.entity.OrderItem;
import com.renbobridal.module.order.entity.TailoringOrder;
import com.renbobridal.module.auth.entity.CustomerMeasurement;
import com.renbobridal.module.order.repository.OrderRepository;
import com.renbobridal.module.order.repository.OrderItemRepository;
import com.renbobridal.module.order.repository.TailoringOrderRepository;
import com.renbobridal.module.auth.repository.CustomerMeasurementRepository;
import com.renbobridal.module.product.entity.ProductItem;
import com.renbobridal.module.product.repository.ProductItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import com.renbobridal.module.email.service.EmailService;
import java.util.HashMap;
import java.util.Map;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository     orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final TailoringOrderRepository tailoringOrderRepository;
    private final CustomerMeasurementRepository measurementRepository;
    private final UserRepository      userRepository;
    private final ProductItemRepository productItemRepository;
    private final EmailService        emailService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // ── Customer ────────────────────────────────────────────────────────────

    /**
     * Tạo đơn hàng mới (khách hàng đặt).
     */
    @Transactional
    public OrderDto createOrder(Long customerId, OrderRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Order.OrderType orderType;
        try {
            orderType = Order.OrderType.valueOf(request.getOrderType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Order order = Order.builder()
                .customer(customer)
                .orderType(orderType)
                .status(Order.Status.PENDING)
                .note(request.getNote())
                .items(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderRequest.ItemRequest itemReq : request.getItems()) {
            ProductItem productItem = null;

            if (itemReq.getProductItemId() != null) {
                productItem = productItemRepository.findById(itemReq.getProductItemId())
                        .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

                if (productItem.getStatus() != ProductItem.Status.AVAILABLE) {
                    throw new AppException(ErrorCode.OUT_OF_STOCK);
                }

                // Đánh dấu sản phẩm đang được sử dụng
                if (orderType == Order.OrderType.RENTAL) {
                    productItem.setStatus(ProductItem.Status.RENTED);
                }
                productItemRepository.save(productItem);
            }

            BigDecimal price = itemReq.getPrice() != null ? itemReq.getPrice() : BigDecimal.ZERO;
            totalAmount = totalAmount.add(price);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productItem(productItem)
                    .price(price)
                    .quantity(1)
                    .rentalStartDate(itemReq.getRentalStartDate())
                    .rentalEndDate(itemReq.getRentalEndDate())
                    .notes(itemReq.getNotes())
                    .build();

            order.getItems().add(orderItem);

            // Xử lý May Đo (TAILORING)
            if (orderType == Order.OrderType.TAILORING && itemReq.getMeasurements() != null) {
                // 1. Lưu số đo
                CustomerMeasurement measurement = CustomerMeasurement.builder()
                        .user(customer)
                        .bust(itemReq.getMeasurements().getBust())
                        .waist(itemReq.getMeasurements().getWaist())
                        .hip(itemReq.getMeasurements().getHip())
                        .shoulder(itemReq.getMeasurements().getShoulder())
                        .armLength(itemReq.getMeasurements().getArmLength())
                        .note(itemReq.getNotes())
                        .build();
                measurementRepository.save(measurement);

                // 2. Tạo TailoringOrder
                TailoringOrder tailoringOrder = TailoringOrder.builder()
                        .orderItem(orderItem)
                        .measurement(measurement)
                        .status(TailoringOrder.Status.MEASURED)
                        .notes(itemReq.getNotes())
                        .build();
                // We will save order first, then order item, then tailoring order to avoid transient instance issues.
                // Spring Data JPA handles cascading if setup properly, but we'll do it explicitly after order is saved.
                orderItem.setNotes("Tailoring - " + itemReq.getNotes()); // temporary
            }
        }

        order.setTotalAmount(totalAmount);
        Order saved = orderRepository.save(order);

        // Lưu TailoringOrder sau khi Order và OrderItem đã có ID
        if (orderType == Order.OrderType.TAILORING) {
            for (int i = 0; i < request.getItems().size(); i++) {
                OrderRequest.ItemRequest itemReq = request.getItems().get(i);
                if (itemReq.getMeasurements() != null) {
                    OrderItem savedItem = saved.getItems().get(i);
                    CustomerMeasurement measurement = measurementRepository.findByUserId(customer.getId())
                            .stream().reduce((first, second) -> second).orElse(null); // Lấy cái mới nhất

                    if (measurement != null) {
                        TailoringOrder tailoringOrder = TailoringOrder.builder()
                                .orderItem(savedItem)
                                .measurement(measurement)
                                .status(TailoringOrder.Status.MEASURED)
                                .notes(itemReq.getNotes())
                                .build();
                        tailoringOrderRepository.save(tailoringOrder);
                    }
                }
            }
        }

        log.info("[ORDER] Created orderId={} customerId={} type={} total={}",
                saved.getId(), customerId, orderType, totalAmount);
                
        // Gửi email xác nhận
        Map<String, Object> emailVariables = new HashMap<>();
        emailVariables.put("orderId", saved.getId());
        emailVariables.put("customerName", customer.getFullName());
        emailVariables.put("orderType", orderType.name());
        emailVariables.put("note", saved.getNote());
        emailVariables.put("totalAmount", totalAmount);
        emailVariables.put("frontendUrl", frontendUrl);
        
        emailService.sendHtmlEmail(
                customer.getEmail(),
                "Xác Nhận Đơn Hàng #" + saved.getId() + " - Renbo Bridal",
                "order-confirmation",
                emailVariables
        );

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getOrdersByCustomer(Long customerId, Pageable pageable) {
        return orderRepository.findByCustomerId(customerId, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getCustomer().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        return mapToDto(order);
    }

    @Transactional
    public void cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getCustomer().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        if (order.getStatus() != Order.Status.PENDING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_CANCELLED);
        }

        order.setStatus(Order.Status.CANCELLED);
        restoreItemStatus(order);
        orderRepository.save(order);

        log.info("[ORDER] Cancelled orderId={} by userId={}", orderId, userId);
    }

    // ── Admin ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrders(
            Pageable pageable,
            Order.Status status,
            Order.OrderType orderType,
            String customerSearch,
            java.time.LocalDate from,
            java.time.LocalDate to) {

        var spec = OrderSpecification.buildFilter(status, orderType, customerSearch, from, to);
        return orderRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    /** Backward compat overload (no search/date) */
    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrders(Pageable pageable, Order.Status status, Order.OrderType orderType) {
        return getAllOrders(pageable, status, orderType, null, null, null);
    }

    @Transactional
    public OrderDto assignStaff(Long orderId, Long staffId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        com.renbobridal.module.auth.entity.User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        order.setStaff(staff);
        Order saved = orderRepository.save(order);
        log.info("[ORDER] Assigned staffId={} to orderId={}", staffId, orderId);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByIdAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return mapToDto(order);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, Order.Status newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Order.Status oldStatus = order.getStatus();
        if (oldStatus != Order.Status.CANCELLED && newStatus == Order.Status.CANCELLED) {
            restoreItemStatus(order);
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);

        log.info("[ORDER] Status updated orderId={} {} -> {}", orderId, oldStatus, newStatus);
        return mapToDto(saved);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private void restoreItemStatus(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getProductItem() != null) {
                item.getProductItem().setStatus(ProductItem.Status.AVAILABLE);
                productItemRepository.save(item.getProductItem());
            }
        }
    }

    private OrderDto mapToDto(Order order) {
        List<OrderDto.OrderItemDto> items = order.getItems().stream()
                .map(item -> {
                    String productName = null;
                    String sku = null;
                    if (item.getProductItem() != null) {
                        productName = item.getProductItem().getProduct() != null
                                ? item.getProductItem().getProduct().getName() : null;
                        sku = item.getProductItem().getSku();
                    }
                    return OrderDto.OrderItemDto.builder()
                            .id(item.getId())
                            .productItemId(item.getProductItem() != null ? item.getProductItem().getId() : null)
                            .productName(productName)
                            .sku(sku)
                            .price(item.getPrice())
                            .rentalStartDate(item.getRentalStartDate())
                            .rentalEndDate(item.getRentalEndDate())
                            .notes(item.getNotes())
                            .build();
                })
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getFullName())
                .customerEmail(order.getCustomer().getEmail())
                .customerPhone(order.getCustomer().getPhone())
                .staffId(order.getStaff() != null ? order.getStaff().getId() : null)
                .staffName(order.getStaff() != null ? order.getStaff().getFullName() : null)
                .orderType(order.getOrderType().name())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }
}
