package com.renbobridal.module.order.service;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.common.service.EmailService;
import com.renbobridal.module.order.dto.TailoringOrderDto;
import com.renbobridal.module.order.dto.TailoringOrderDto.FittingSessionDto;
import com.renbobridal.module.order.dto.TailoringOrderRequest;
import com.renbobridal.module.order.entity.FittingSession;
import com.renbobridal.module.order.entity.Order;
import com.renbobridal.module.order.entity.OrderItem;
import com.renbobridal.module.order.entity.TailoringOrder;
import com.renbobridal.module.order.repository.OrderItemRepository;
import com.renbobridal.module.order.repository.TailoringOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TailoringOrderService {

    private final TailoringOrderRepository tailoringOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<TailoringOrderDto> getAllTailoringOrders() {
        return tailoringOrderRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TailoringOrderDto getTailoringOrderByOrderItemId(Long orderItemId) {
        TailoringOrder order = tailoringOrderRepository.findByOrderItemId(orderItemId)
                .orElseThrow(() -> new AppException(ErrorCode.TAILORING_ORDER_NOT_FOUND));
        return mapToDto(order);
    }

    @Transactional(readOnly = true)
    public TailoringOrderDto getTailoringOrderById(Long id) {
        TailoringOrder order = tailoringOrderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TAILORING_ORDER_NOT_FOUND));
        return mapToDto(order);
    }

    @Transactional
    public TailoringOrderDto createTailoringOrder(Long orderItemId, TailoringOrderRequest request) {
        if (tailoringOrderRepository.findByOrderItemId(orderItemId).isPresent()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST));

        if (!orderItem.getOrder().getOrderType().equals(Order.OrderType.TAILORING)) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        TailoringOrder tailoringOrder = TailoringOrder.builder()
                .orderItem(orderItem)
                .notes(request.getNotes())
                .expectedCompletionDate(request.getExpectedCompletionDate())
                .status(TailoringOrder.Status.MEASURED)  // Luôn bắt đầu từ MEASURED
                .build();

        TailoringOrderDto dto = mapToDto(tailoringOrderRepository.save(tailoringOrder));
        log.info("[TAILORING] Created tailoringOrderId={} for orderItemId={}", dto.getId(), orderItemId);
        return dto;
    }

    /**
     * Cập nhật đơn may đo — áp dụng State Machine validation.
     * Chỉ cho phép chuyển trạng thái theo chiều hợp lệ:
     * MEASURED → CUTTING → SEWING → FITTING → DONE
     */
    @Transactional
    public TailoringOrderDto updateTailoringOrder(Long id, TailoringOrderRequest request) {
        TailoringOrder tailoringOrder = tailoringOrderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TAILORING_ORDER_NOT_FOUND));

        boolean statusChanged = false;
        TailoringOrder.Status newStatus = null;

        if (request.getStatus() != null) {
            TailoringOrder.Status currentStatus = tailoringOrder.getStatus();
            try {
                newStatus = TailoringOrder.Status.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.INVALID_TAILORING_STATUS_TRANSITION);
            }

            // ── State Machine Validation ──────────────────────────────────────
            if (!currentStatus.canTransitionTo(newStatus)) {
                log.warn("[TAILORING] Invalid transition: tailoringId={} {} -> {}",
                        id, currentStatus, newStatus);
                throw new AppException(ErrorCode.INVALID_TAILORING_STATUS_TRANSITION);
            }

            tailoringOrder.setStatus(newStatus);
            statusChanged = true;
            log.info("[TAILORING] Status transitioned: tailoringId={} {} -> {}", id, currentStatus, newStatus);
        }

        if (request.getNotes() != null) {
            tailoringOrder.setNotes(request.getNotes());
        }
        if (request.getExpectedCompletionDate() != null) {
            tailoringOrder.setExpectedCompletionDate(request.getExpectedCompletionDate());
        }

        TailoringOrder savedOrder = tailoringOrderRepository.save(tailoringOrder);
        TailoringOrderDto dto = mapToDto(savedOrder);

        // Gửi email thông báo nếu đổi sang FITTING hoặc DONE
        if (statusChanged && dto.getCustomerEmail() != null) {
            try {
                if (newStatus == TailoringOrder.Status.FITTING) {
                    String title = "Đã Sẵn Sàng Thử Đồ";
                    String subject = "[Renbo Bridal] Đơn may đo #" + savedOrder.getId() + " đã sẵn sàng thử đồ";
                    String text = String.format("<p style='font-size:15px;color:#555;'>Chào <strong>%s</strong>,</p><p style='font-size:15px;color:#555;'>Váy cưới may đo của bạn đã hoàn tất phần khung và sẵn sàng cho buổi thử đồ (Fitting) đầu tiên. Vui lòng liên hệ với chúng tôi để đặt lịch thử.</p><br><p style='font-size:15px;color:#555;'>Trân trọng,<br>Renbo Bridal</p>", dto.getCustomerName());
                    emailService.sendCustomEmail(dto.getCustomerEmail(), title, subject, text);
                } else if (newStatus == TailoringOrder.Status.DONE) {
                    String title = "Đơn May Đo Đã Hoàn Thành";
                    String subject = "[Renbo Bridal] Đơn may đo #" + savedOrder.getId() + " đã hoàn thành";
                    String text = String.format("<p style='font-size:15px;color:#555;'>Chào <strong>%s</strong>,</p><p style='font-size:15px;color:#555;'>Váy cưới may đo của bạn đã hoàn thành và sẵn sàng được giao nhận. Cảm ơn bạn đã tin tưởng Renbo Bridal.</p><br><p style='font-size:15px;color:#555;'>Trân trọng,<br>Renbo Bridal</p>", dto.getCustomerName());
                    emailService.sendCustomEmail(dto.getCustomerEmail(), title, subject, text);
                }
            } catch (Exception e) {
                log.error("[TAILORING] Failed to send email for tailoringOrderId={}: {}", id, e.getMessage());
            }
        }

        return dto;
    }


    // ── Mappers ──────────────────────────────────────────────────────────────

    public TailoringOrderDto mapToDto(TailoringOrder entity) {
        OrderItem orderItem = entity.getOrderItem();
        Order order = (orderItem != null) ? orderItem.getOrder() : null;

        String customerName  = null;
        String customerEmail = null;
        String customerPhone = null;
        if (order != null && order.getCustomer() != null) {
            customerName  = order.getCustomer().getFullName();
            customerEmail = order.getCustomer().getEmail();
            customerPhone = order.getCustomer().getPhone();
        }

        String productName = null;
        String productSku  = null;
        if (orderItem != null && orderItem.getProductItem() != null) {
            productSku = orderItem.getProductItem().getSku();
            if (orderItem.getProductItem().getProduct() != null) {
                productName = orderItem.getProductItem().getProduct().getName();
            }
        }

        // Measurement info
        String bust = null, waist = null, hip = null, shoulder = null, armLength = null;
        if (entity.getMeasurement() != null) {
            var m = entity.getMeasurement();
            bust      = m.getBust()      != null ? m.getBust().toPlainString()      : null;
            waist     = m.getWaist()     != null ? m.getWaist().toPlainString()     : null;
            hip       = m.getHip()       != null ? m.getHip().toPlainString()       : null;
            shoulder  = m.getShoulder()  != null ? m.getShoulder().toPlainString()  : null;
            armLength = m.getArmLength() != null ? m.getArmLength().toPlainString() : null;
        }

        return TailoringOrderDto.builder()
                .id(entity.getId())
                .orderItemId(orderItem != null ? orderItem.getId() : null)
                .orderId(order != null ? order.getId() : null)
                .status(entity.getStatus().name())
                .allowedNextStatuses(entity.getStatus().allowedNext().stream()
                        .map(TailoringOrder.Status::name).collect(Collectors.toList()))
                .notes(entity.getNotes())
                .expectedCompletionDate(entity.getExpectedCompletionDate())
                .customerName(customerName)
                .customerEmail(customerEmail)
                .customerPhone(customerPhone)
                .productName(productName)
                .productSku(productSku)
                .bust(bust)
                .waist(waist)
                .hip(hip)
                .shoulder(shoulder)
                .armLength(armLength)
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
                .fittingSessions(entity.getFittingSessions() == null ? null : entity.getFittingSessions().stream()
                        .map(this::mapToFittingSessionDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private FittingSessionDto mapToFittingSessionDto(FittingSession entity) {
        TailoringOrder to = entity.getTailoringOrder();
        OrderItem oi = (to != null) ? to.getOrderItem() : null;
        Order ord = (oi != null) ? oi.getOrder() : null;

        String customerName = null;
        if (ord != null && ord.getCustomer() != null) customerName = ord.getCustomer().getFullName();

        String productName = null;
        if (oi != null && oi.getProductItem() != null && oi.getProductItem().getProduct() != null) {
            productName = oi.getProductItem().getProduct().getName();
        }

        return FittingSessionDto.builder()
                .id(entity.getId())
                .tailoringOrderId(to != null ? to.getId() : null)
                .orderId(ord != null ? ord.getId() : null)
                .staffId(entity.getStaff() != null ? entity.getStaff().getId() : null)
                .staffName(entity.getStaff() != null ? entity.getStaff().getFullName() : null)
                .fittingDate(entity.getFittingDate() != null ? entity.getFittingDate().toString() : null)
                .status(entity.getStatus().name())
                .notes(entity.getNotes())
                .customerName(customerName)
                .productName(productName)
                .build();
    }
}
