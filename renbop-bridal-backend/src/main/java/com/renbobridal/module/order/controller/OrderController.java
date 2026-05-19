package com.renbobridal.module.order.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.order.dto.OrderDto;
import com.renbobridal.module.order.dto.OrderRequest;
import com.renbobridal.module.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order", description = "Endpoints for managing orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create a new order")
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody OrderRequest request) {
        OrderDto order = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Đặt hàng thành công", order));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user's order history")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getMyOrders(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrdersByCustomer(userId, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderById(userId, id)));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a pending order")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        orderService.cancelOrder(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Đã hủy đơn hàng"));
    }
}
