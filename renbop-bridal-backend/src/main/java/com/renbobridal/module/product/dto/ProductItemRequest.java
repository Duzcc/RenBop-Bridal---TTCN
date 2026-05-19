package com.renbobridal.module.product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductItemRequest {

    @NotBlank(message = "Mã SKU không được trống")
    private String sku;

    private String size;

    private String color;

    private String status; // AVAILABLE, RENTED, MAINTENANCE, DAMAGED, SOLD
}
