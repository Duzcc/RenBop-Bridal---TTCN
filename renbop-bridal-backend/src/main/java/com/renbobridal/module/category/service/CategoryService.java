package com.renbobridal.module.category.service;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.common.util.SlugUtil;
import com.renbobridal.module.category.dto.CategoryDto;
import com.renbobridal.module.category.dto.CategoryRequest;
import com.renbobridal.module.category.entity.Category;
import com.renbobridal.module.category.repository.CategoryRepository;
import com.renbobridal.module.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    // ── Public ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    @Cacheable(value = "categories")
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "category", key = "#slug")
    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return mapToDto(category);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "category", key = "#id")
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return mapToDto(category);
    }

    // ── Admin CRUD ────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = {"categories", "category"}, allEntries = true)
    public CategoryDto createCategory(CategoryRequest request) {
        String slug = resolveSlug(request.getSlug(), request.getName());

        if (categoryRepository.findBySlug(slug).isPresent()) {
            throw new AppException(ErrorCode.CATEGORY_SLUG_EXISTS);
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .build();

        return mapToDto(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = {"categories", "category"}, allEntries = true)
    public CategoryDto updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        String slug = resolveSlug(request.getSlug(), request.getName());

        // Cho phép slug giữ nguyên hoặc slug mới chưa tồn tại
        if (!slug.equals(category.getSlug()) && categoryRepository.findBySlug(slug).isPresent()) {
            throw new AppException(ErrorCode.CATEGORY_SLUG_EXISTS);
        }

        category.setName(request.getName());
        category.setSlug(slug);
        category.setDescription(request.getDescription());

        return mapToDto(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = {"categories", "category"}, allEntries = true)
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Không cho xóa nếu còn sản phẩm thuộc danh mục này
        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new AppException(ErrorCode.CANNOT_DELETE_CATEGORY_WITH_PRODUCTS);
        }

        categoryRepository.delete(category);
    }

    // ── Mapper (public để dùng trong ProductService) ──────────

    public CategoryDto mapToDto(Category category) {
        if (category == null) return null;
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .build();
    }

    // ── Helper ────────────────────────────────────────────────

    private String resolveSlug(String requestSlug, String name) {
        if (requestSlug != null && !requestSlug.isBlank()) {
            return requestSlug.trim().toLowerCase();
        }
        return SlugUtil.toSlug(name);
    }
}
