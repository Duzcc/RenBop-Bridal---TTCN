package com.renbobridal.module.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CustomerMeasurementDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String label;
    private String gender; // "MALE" or "FEMALE"
    private BigDecimal bust;
    private BigDecimal waist;
    private BigDecimal hip;
    private BigDecimal shoulder;
    private BigDecimal armLength;
    private String note;
    private java.time.Instant createdAt;
}
