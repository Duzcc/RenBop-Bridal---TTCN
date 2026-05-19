package com.renbobridal.module.order.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class OrderDto {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Long staffId;
    private String staffName;
    private String orderType;
    private String status;
    private BigDecimal totalAmount;
    private String note;
    private Instant createdAt;
    private List<OrderItemDto> items;

    @Data
    @Builder
    public static class OrderItemDto {
        private Long id;
        private Long productItemId;
        private String productName;
        private String sku;
        private BigDecimal price;
        private LocalDate rentalStartDate;
        private LocalDate rentalEndDate;
        private String notes;
    }
}
