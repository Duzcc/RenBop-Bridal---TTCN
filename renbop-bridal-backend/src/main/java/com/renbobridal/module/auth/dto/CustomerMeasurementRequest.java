package com.renbobridal.module.auth.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CustomerMeasurementRequest {

    private String label;

    private String gender; // "MALE" or "FEMALE"

    @DecimalMin(value = "0.0", message = "Số đo không hợp lệ")
    private BigDecimal bust;

    @DecimalMin(value = "0.0", message = "Số đo không hợp lệ")
    private BigDecimal waist;

    @DecimalMin(value = "0.0", message = "Số đo không hợp lệ")
    private BigDecimal hip;

    @DecimalMin(value = "0.0", message = "Số đo không hợp lệ")
    private BigDecimal shoulder;

    @DecimalMin(value = "0.0", message = "Số đo không hợp lệ")
    private BigDecimal armLength;

    private String note;
}
