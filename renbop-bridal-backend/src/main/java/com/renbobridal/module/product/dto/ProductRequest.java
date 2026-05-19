package com.renbobridal.module.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {

    @NotBlank(message = "Tên sản phẩm không được trống")
    private String name;

    private String slug;

    private String description;

    @NotNull(message = "Giá cơ bản không được trống")
    @Min(value = 0, message = "Giá không được số âm")
    private BigDecimal basePrice;

    /** Giá khuyến mãi (tuỳ chọn) */
    private BigDecimal salePrice;

    private Long categoryId;

    /** Danh sách URL ảnh Cloudinary */
    private List<String> imageUrls;
}
