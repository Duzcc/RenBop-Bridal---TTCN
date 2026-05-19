package com.renbobridal.module.category.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryDto {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
}
