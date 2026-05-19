package com.renbobridal.module.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class OrderRequest {

    @NotBlank(message = "Loại đơn hàng không được để trống")
    private String orderType; // RENTAL, TAILORING, PURCHASE

    private String note;

    @NotEmpty(message = "Danh sách sản phẩm không được trống")
    private List<ItemRequest> items;

    @Data
    public static class ItemRequest {
        private Long productItemId;  // null nếu là may đo mới

        @NotNull(message = "Giá không được để trống")
        private BigDecimal price;

        private LocalDate rentalStartDate;
        private LocalDate rentalEndDate;
        private String notes;
        private MeasurementRequest measurements;
    }

    @Data
    public static class MeasurementRequest {
        private BigDecimal bust;
        private BigDecimal waist;
        private BigDecimal hip;
        private BigDecimal shoulder;
        private BigDecimal armLength;
    }
}
