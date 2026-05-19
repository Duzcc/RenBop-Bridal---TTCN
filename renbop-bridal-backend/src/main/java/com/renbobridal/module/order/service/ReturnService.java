package com.renbobridal.module.order.service;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.module.auth.entity.User;
import com.renbobridal.module.auth.repository.UserRepository;
import com.renbobridal.module.order.dto.ReturnDto;
import com.renbobridal.module.order.dto.ReturnDto.DamageDto;
import com.renbobridal.module.order.dto.ReturnRequest;
import com.renbobridal.module.order.entity.Damage;
import com.renbobridal.module.order.entity.Order;
import com.renbobridal.module.order.entity.Return;
import com.renbobridal.module.product.entity.ProductItem;
import com.renbobridal.module.product.repository.ProductItemRepository;
import com.renbobridal.module.order.repository.OrderRepository;
import com.renbobridal.module.order.repository.ReturnRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReturnService {

    private final ReturnRepository returnRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductItemRepository productItemRepository;

    /** Phí trễ mỗi ngày (VND) */
    private static final BigDecimal DAILY_LATE_FEE = new BigDecimal("50000");
    /** Múi giờ Việt Nam */
    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    // ── Read ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ReturnDto> getAllReturns() {
        return returnRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReturnDto getReturnById(Long id) {
        Return returnRecord = returnRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RETURN_NOT_FOUND));
        return mapToDto(returnRecord);
    }

    @Transactional(readOnly = true)
    public ReturnDto getReturnByOrderId(Long orderId) {
        Return returnRecord = returnRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.RETURN_NOT_FOUND));
        return mapToDto(returnRecord);
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    @Transactional
    public ReturnDto processReturn(Long orderId, ReturnRequest request, Long staffId) {
        if (returnRepository.findByOrderId(orderId).isPresent()) {
            throw new AppException(ErrorCode.RETURN_ALREADY_PROCESSED);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getOrderType().equals(Order.OrderType.RENTAL)) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        User staff = null;
        if (staffId != null) {
            staff = userRepository.findById(staffId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        // ── Tính phí trễ (dùng múi giờ Việt Nam) ────────────────────────────
        Return.Status status = Return.Status.ON_TIME;
        BigDecimal lateFee = BigDecimal.ZERO;

        var maxEndDateOpt = order.getItems().stream()
                .filter(item -> item.getRentalEndDate() != null)
                .map(item -> item.getRentalEndDate())
                .max(LocalDate::compareTo);

        if (maxEndDateOpt.isPresent()) {
            LocalDate maxEndDate = maxEndDateOpt.get();
            // ✅ FIX: Dùng timezone Việt Nam thay vì systemDefault()
            LocalDate returnDateLocal = LocalDate.ofInstant(request.getReturnDate(), VN_ZONE);

            if (returnDateLocal.isAfter(maxEndDate)) {
                status = Return.Status.LATE;
                long daysLate = ChronoUnit.DAYS.between(maxEndDate, returnDateLocal);
                lateFee = DAILY_LATE_FEE.multiply(BigDecimal.valueOf(daysLate));
                log.info("[RETURN] orderId={} late by {} day(s), lateFee={}", orderId, daysLate, lateFee);
            }
        }

        // Override nếu admin tự nhập status
        if (request.getStatus() != null) {
            try {
                status = Return.Status.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }

        Return returnRecord = Return.builder()
                .order(order)
                .receiverStaff(staff)
                .returnDate(request.getReturnDate())
                .status(status)
                .lateFee(lateFee)
                .build();

        Return saved = returnRepository.save(returnRecord);

        // ── Tự động cập nhật trạng thái sản phẩm về AVAILABLE ────────────────
        restoreProductItems(order);

        // ── Cập nhật trạng thái đơn hàng → COMPLETED ─────────────────────────
        order.setStatus(Order.Status.COMPLETED);
        orderRepository.save(order);

        log.info("[RETURN] Processed returnId={} orderId={} status={} lateFee={}", 
                saved.getId(), orderId, status, lateFee);
        return mapToDto(saved);
    }

    /**
     * Cập nhật phiếu trả đồ (admin điều chỉnh phí trễ, trạng thái).
     */
    @Transactional
    public ReturnDto updateReturn(Long returnId, ReturnRequest request) {
        Return returnRecord = returnRepository.findById(returnId)
                .orElseThrow(() -> new AppException(ErrorCode.RETURN_NOT_FOUND));

        if (request.getStatus() != null) {
            try {
                returnRecord.setStatus(Return.Status.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }

        if (request.getReturnDate() != null) {
            returnRecord.setReturnDate(request.getReturnDate());
        }

        // Tái tính phí trễ nếu có cập nhật ngày
        if (request.getReturnDate() != null) {
            Order order = returnRecord.getOrder();
            var maxEndDateOpt = order.getItems().stream()
                    .filter(item -> item.getRentalEndDate() != null)
                    .map(item -> item.getRentalEndDate())
                    .max(LocalDate::compareTo);

            if (maxEndDateOpt.isPresent()) {
                LocalDate maxEndDate = maxEndDateOpt.get();
                LocalDate returnDateLocal = LocalDate.ofInstant(request.getReturnDate(), VN_ZONE);
                if (returnDateLocal.isAfter(maxEndDate)) {
                    long daysLate = ChronoUnit.DAYS.between(maxEndDate, returnDateLocal);
                    returnRecord.setLateFee(DAILY_LATE_FEE.multiply(BigDecimal.valueOf(daysLate)));
                } else {
                    returnRecord.setLateFee(BigDecimal.ZERO);
                }
            }
        }

        log.info("[RETURN] Updated returnId={}", returnId);
        return mapToDto(returnRepository.save(returnRecord));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Tự động đặt trạng thái tất cả ProductItem của đơn hàng về AVAILABLE sau khi trả.
     */
    private void restoreProductItems(Order order) {
        order.getItems().forEach(item -> {
            if (item.getProductItem() != null) {
                ProductItem pi = item.getProductItem();
                if (pi.getStatus() == ProductItem.Status.RENTED) {
                    pi.setStatus(ProductItem.Status.AVAILABLE);
                    productItemRepository.save(pi);
                    log.info("[RETURN] Restored productItemId={} sku={} to AVAILABLE",
                            pi.getId(), pi.getSku());
                }
            }
        });
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    public ReturnDto mapToDto(Return entity) {
        String customerName  = null;
        String customerEmail = null;
        if (entity.getOrder() != null && entity.getOrder().getCustomer() != null) {
            customerName  = entity.getOrder().getCustomer().getFullName();
            customerEmail = entity.getOrder().getCustomer().getEmail();
        }

        return ReturnDto.builder()
                .id(entity.getId())
                .orderId(entity.getOrder().getId())
                .customerName(customerName)
                .customerEmail(customerEmail)
                .receiverStaffId(entity.getReceiverStaff() != null ? entity.getReceiverStaff().getId() : null)
                .receiverStaffName(entity.getReceiverStaff() != null ? entity.getReceiverStaff().getFullName() : null)
                .returnDate(entity.getReturnDate().toString())
                .status(entity.getStatus().name())
                .lateFee(entity.getLateFee())
                .rentedItems(entity.getOrder() != null && entity.getOrder().getItems() != null
                        ? entity.getOrder().getItems().stream()
                                .filter(item -> item.getProductItem() != null)
                                .map(item -> ReturnDto.RentedItemDto.builder()
                                        .productItemId(item.getProductItem().getId())
                                        .productSku(item.getProductItem().getSku())
                                        .productName(item.getProductItem().getProduct() != null
                                                ? item.getProductItem().getProduct().getName() : "Unknown")
                                        .build())
                                .collect(Collectors.toList())
                        : null)
                .damages(entity.getDamages() == null ? null : entity.getDamages().stream()
                        .map(this::mapToDamageDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private DamageDto mapToDamageDto(Damage damage) {
        return DamageDto.builder()
                .id(damage.getId())
                .productItemId(damage.getProductItem().getId())
                .productSku(damage.getProductItem().getSku())
                .description(damage.getDescription())
                .repairCost(damage.getRepairCost())
                .chargedToCustomer(damage.getChargedToCustomer())
                .build();
    }
}
