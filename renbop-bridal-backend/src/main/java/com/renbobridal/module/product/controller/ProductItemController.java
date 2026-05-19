package com.renbobridal.module.product.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.product.dto.ProductDto.ProductItemDto;
import com.renbobridal.module.product.dto.ProductItemRequest;
import com.renbobridal.module.product.service.ProductItemService;
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
@RequestMapping("/api/product-items")
@RequiredArgsConstructor
@Tag(name = "Product Item", description = "Endpoints for managing product physical inventory items (SKUs)")
public class ProductItemController {

    private final ProductItemService productItemService;

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get all items for a product")
    public ResponseEntity<ApiResponse<List<ProductItemDto>>> getItemsByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(productItemService.getItemsByProductId(productId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific product item by ID")
    public ResponseEntity<ApiResponse<ProductItemDto>> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productItemService.getItemById(id)));
    }

    @PostMapping("/product/{productId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Add a new physical item (SKU) to a product")
    public ResponseEntity<ApiResponse<ProductItemDto>> addProductItem(
            @PathVariable Long productId,
            @Valid @RequestBody ProductItemRequest request) {
        ProductItemDto created = productItemService.addProductItem(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm sản phẩm vật lý thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Update a product item")
    public ResponseEntity<ApiResponse<ProductItemDto>> updateProductItem(
            @PathVariable Long id,
            @Valid @RequestBody ProductItemRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công", productItemService.updateProductItem(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Delete a product item")
    public ResponseEntity<ApiResponse<Void>> deleteProductItem(@PathVariable Long id) {
        productItemService.deleteProductItem(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa thành công"));
    }
}
