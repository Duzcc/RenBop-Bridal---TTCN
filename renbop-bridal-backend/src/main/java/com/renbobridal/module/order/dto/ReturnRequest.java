package com.renbobridal.module.order.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class ReturnRequest {

    @NotNull(message = "Ngày trả đồ không được trống")
    private Instant returnDate;

    private String status; // ON_TIME, LATE
}
