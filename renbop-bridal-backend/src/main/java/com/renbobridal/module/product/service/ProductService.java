package com.renbobridal.module.product.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.common.util.SlugUtil;
import com.renbobridal.module.category.entity.Category;
import com.renbobridal.module.category.repository.CategoryRepository;
import com.renbobridal.module.category.service.CategoryService;
import com.renbobridal.module.product.dto.ProductDto;
import com.renbobridal.module.product.dto.ProductRequest;
import com.renbobridal.module.product.entity.Product;
import com.renbobridal.module.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository  productRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryService    categoryService;
    private final ObjectMapper       objectMapper;

    // ── Public ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ProductDto> searchProducts(String keyword, String categorySlug, Pageable pageable) {
        String safeKeyword  = (keyword != null && !keyword.isBlank())       ? keyword.trim()       : null;
        String safeCategory = (categorySlug != null && !categorySlug.isBlank()) ? categorySlug.trim() : null;

        return productRepository.searchProducts(safeKeyword, safeCategory, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "product", key = "#id")
    public ProductDto getProductById(Long id) {
        return mapToDto(productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND)));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "product", key = "#slug")
    public ProductDto getProductBySlug(String slug) {
        return mapToDto(productRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND)));
    }

    // ── Admin CRUD ────────────────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ProductDto createProduct(ProductRequest request) {
        String slug = resolveSlug(request.getSlug(), request.getName());

        if (productRepository.findBySlug(slug).isPresent()) {
            throw new AppException(ErrorCode.PRODUCT_SLUG_EXISTS);
        }

        Category category = resolveCategory(request.getCategoryId());

        Product product = Product.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .salePrice(request.getSalePrice())
                .imageUrls(serializeImageUrls(request.getImageUrls()))
                .category(category)
                .build();

        return mapToDto(productRepository.save(product));
    }

    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ProductDto updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        String slug = resolveSlug(request.getSlug(), request.getName());

        if (!slug.equals(product.getSlug()) && productRepository.findBySlug(slug).isPresent()) {
            throw new AppException(ErrorCode.PRODUCT_SLUG_EXISTS);
        }

        product.setName(request.getName());
        product.setSlug(slug);
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setSalePrice(request.getSalePrice());
        if (request.getImageUrls() != null) {
            product.setImageUrls(serializeImageUrls(request.getImageUrls()));
        }
        product.setCategory(resolveCategory(request.getCategoryId()));

        return mapToDto(productRepository.save(product));
    }

    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        productRepository.delete(product);
    }

    // ── Mapper & Helper ───────────────────────────────────────────────────────

    private ProductDto mapToDto(Product product) {
        List<ProductDto.ProductItemDto> items = product.getItems().stream()
                .map(item -> ProductDto.ProductItemDto.builder()
                        .id(item.getId())
                        .sku(item.getSku())
                        .size(item.getSize())
                        .color(item.getColor())
                        .status(item.getStatus().name())
                        .build())
                .collect(Collectors.toList());

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .salePrice(product.getSalePrice())
                .imageUrls(deserializeImageUrls(product.getImageUrls()))
                .category(product.getCategory() != null ? categoryService.mapToDto(product.getCategory()) : null)
                .items(items)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private String resolveSlug(String requestSlug, String name) {
        if (requestSlug != null && !requestSlug.isBlank()) {
            return requestSlug.trim().toLowerCase();
        }
        return SlugUtil.toSlug(name);
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    /** Chuyển List<String> → JSON string để lưu vào DB */
    private String serializeImageUrls(List<String> urls) {
        if (urls == null || urls.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(urls);
        } catch (JsonProcessingException e) {
            log.warn("[PRODUCT] Failed to serialize imageUrls: {}", e.getMessage());
            return null;
        }
    }

    /** Chuyển JSON string → List<String> khi trả về frontend */
    private List<String> deserializeImageUrls(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            log.warn("[PRODUCT] Failed to deserialize imageUrls: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
