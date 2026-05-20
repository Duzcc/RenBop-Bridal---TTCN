package com.renbobridal.module.category.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.category.dto.CategoryDto;
import com.renbobridal.module.category.dto.CategoryRequest;
import com.renbobridal.module.category.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Category", description = "Endpoints for managing categories")
public class CategoryController {

    private final CategoryService categoryService;

    // ── Public ────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "Get all categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategories()));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get a category by slug")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryBySlug(slug)));
    }

    // ── Admin ─────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Create a new category")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        CategoryDto created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo danh mục thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Update a category")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryDto updated = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật danh mục thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Delete a category (only if no products exist)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa danh mục thành công"));
    }

    @PutMapping("/{id}/products")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Assign products to category")
    public ResponseEntity<ApiResponse<Void>> assignProductsToCategory(
            @PathVariable Long id,
            @RequestBody List<Long> productIds) {
        categoryService.assignProductsToCategory(id, productIds);
        return ResponseEntity.ok(ApiResponse.ok("Sắp xếp sản phẩm vào danh mục thành công"));
    }
}
