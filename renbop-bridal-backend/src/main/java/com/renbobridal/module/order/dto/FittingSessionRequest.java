package com.renbobridal.module.order.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class FittingSessionRequest {

    @NotNull(message = "Ngày thử đồ không được trống")
    @FutureOrPresent(message = "Ngày thử đồ phải từ hôm nay trở đi")
    private Instant fittingDate;

    private String notes;

    private String status; // SCHEDULED, COMPLETED, CANCELLED
}
