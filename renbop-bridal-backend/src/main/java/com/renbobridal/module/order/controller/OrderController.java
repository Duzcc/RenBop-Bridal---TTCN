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
import com.renbobridal.module.payment.dto.PaymentDto;
import com.renbobridal.module.payment.dto.PaymentRequest;
import com.renbobridal.module.payment.service.PaymentService;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order", description = "Endpoints for managing orders")
public class OrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;

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

    @PostMapping("/{orderId}/payments")
    @Operation(summary = "Initiate a payment for an order")
    public ResponseEntity<ApiResponse<PaymentDto>> initiatePayment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long orderId,
            @RequestBody PaymentRequest request) {
        PaymentDto payment = paymentService.initiatePayment(orderId, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Khởi tạo thanh toán thành công", payment));
    }

    @PostMapping("/{orderId}/payments/{paymentId}/confirm")
    @Operation(summary = "Confirm a payment for an order")
    public ResponseEntity<ApiResponse<PaymentDto>> confirmPayment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long orderId,
            @PathVariable Long paymentId,
            @RequestParam boolean success) {
        PaymentDto payment = paymentService.confirmPayment(paymentId, userId, success);
        return ResponseEntity.ok(ApiResponse.ok("Xác nhận thanh toán thành công", payment));
    }
}
