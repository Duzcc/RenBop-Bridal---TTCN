package com.renbobridal.module.order.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.order.dto.TailoringOrderDto;
import com.renbobridal.module.order.dto.TailoringOrderRequest;
import com.renbobridal.module.order.service.TailoringOrderService;
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
@RequestMapping("/api/tailoring-orders")
@RequiredArgsConstructor
@Tag(name = "Tailoring Order", description = "Endpoints for managing tailoring tracking")
public class TailoringOrderController {

    private final TailoringOrderService tailoringOrderService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Get all tailoring orders with customer & product context")
    public ResponseEntity<ApiResponse<List<TailoringOrderDto>>> getAllTailoringOrders() {
        return ResponseEntity.ok(ApiResponse.ok(tailoringOrderService.getAllTailoringOrders()));
    }

    @GetMapping("/item/{orderItemId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "Get tailoring tracking info for an order item")
    public ResponseEntity<ApiResponse<TailoringOrderDto>> getByOrderItemId(@PathVariable Long orderItemId) {
        return ResponseEntity.ok(ApiResponse.ok(tailoringOrderService.getTailoringOrderByOrderItemId(orderItemId)));
    }

    @PostMapping("/item/{orderItemId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Create tailoring tracking for an order item")
    public ResponseEntity<ApiResponse<TailoringOrderDto>> createTailoringOrder(
            @PathVariable Long orderItemId,
            @Valid @RequestBody TailoringOrderRequest request) {
        TailoringOrderDto created = tailoringOrderService.createTailoringOrder(orderItemId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo phiếu may đo thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Update tailoring order status or details")
    public ResponseEntity<ApiResponse<TailoringOrderDto>> updateTailoringOrder(
            @PathVariable Long id,
            @Valid @RequestBody TailoringOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật phiếu may đo thành công", tailoringOrderService.updateTailoringOrder(id, request)));
    }
}
