package com.renbobridal.module.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DamageRequest {

    @NotBlank(message = "Mô tả hư hỏng không được trống")
    private String description;

    @Min(value = 0, message = "Chi phí sửa chữa không được âm")
    private BigDecimal repairCost;

    private Boolean chargedToCustomer;

    private String severity; // MINOR, MODERATE, SEVERE, LOST
}
