package com.renbobridal.module.order.dto;

import jakarta.validation.constraints.FutureOrPresent;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TailoringOrderRequest {

    private String notes;

    @FutureOrPresent(message = "Ngày hoàn thành dự kiến phải từ hôm nay trở đi")
    private LocalDate expectedCompletionDate;

    private String status; // MEASURED, CUTTING, SEWING, FITTING, DONE
}
