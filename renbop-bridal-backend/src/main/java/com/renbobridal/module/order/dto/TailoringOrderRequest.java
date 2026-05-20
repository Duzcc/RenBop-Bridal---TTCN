package com.renbobridal.module.order.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TailoringOrderRequest {

    private String notes;

    private LocalDate expectedCompletionDate;

    private String status; // MEASURED, CUTTING, SEWING, FITTING, DONE
}
