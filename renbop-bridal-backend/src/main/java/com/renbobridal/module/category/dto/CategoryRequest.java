package com.renbobridal.module.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục không được quá 100 ký tự")
    private String name;

    /** Nếu để trống sẽ tự động sinh từ name */
    private String slug;

    private String description;

    private String imageUrl;
}
