package com.renbobridal.module.product.dto;

import com.renbobridal.module.category.dto.CategoryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal basePrice;
    /** Giá khuyến mãi (null nếu không có) */
    private BigDecimal salePrice;
    /** Danh sách URL ảnh sản phẩm (Cloudinary) */
    private List<String> imageUrls;
    private CategoryDto category;
    private List<ProductItemDto> items;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductItemDto {
        private Long id;
        private String sku;
        private String size;
        private String color;
        private String status;
    }
}
