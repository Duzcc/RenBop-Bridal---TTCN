package com.renbobridal.module.order.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ReturnDto {
    private Long id;
    private Long orderId;
    private String customerName;
    private String customerEmail;
    private Long receiverStaffId;
    private String receiverStaffName;
    private String returnDate;
    private String status;
    private BigDecimal lateFee;
    private List<RentedItemDto> rentedItems;
    private List<DamageDto> damages;

    @Data
    @Builder
    public static class RentedItemDto {
        private Long productItemId;
        private String productSku;
        private String productName;
    }

    @Data
    @Builder
    public static class DamageDto {
        private Long id;
        private Long productItemId;
        private String productSku;
        private String description;
        private BigDecimal repairCost;
        private Boolean chargedToCustomer;
    }
}
