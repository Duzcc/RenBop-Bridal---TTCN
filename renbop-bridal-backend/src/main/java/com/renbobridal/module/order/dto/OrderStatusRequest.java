package com.renbobridal.module.order.dto;

import com.renbobridal.module.order.entity.Order;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private Order.Status status;
}
