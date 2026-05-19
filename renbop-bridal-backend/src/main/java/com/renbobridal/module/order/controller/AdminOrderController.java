package com.renbobridal.module.order.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.order.dto.OrderDto;
import com.renbobridal.module.order.dto.OrderStatusRequest;
import com.renbobridal.module.order.entity.Order;
import com.renbobridal.module.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Order", description = "Admin endpoints for managing orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    /**
     * GET /api/admin/orders
     * Hỗ trợ filter nâng cao: status, orderType, tìm theo tên/email khách, khoảng ngày.
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách đơn hàng (filter nâng cao)")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getAllOrders(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Trạng thái: PENDING | IN_PROGRESS | COMPLETED | CANCELLED")
            @RequestParam(required = false) String status,
            @Parameter(description = "Loại đơn: RENTAL | TAILORING | PURCHASE")
            @RequestParam(required = false) String orderType,
            @Parameter(description = "Tìm theo tên hoặc email khách hàng")
            @RequestParam(required = false) String search,
            @Parameter(description = "Từ ngày (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Đến ngày (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Order.Status statusEnum = null;
        if (status != null && !status.isBlank()) {
            try { statusEnum = Order.Status.valueOf(status.toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }
        Order.OrderType typeEnum = null;
        if (orderType != null && !orderType.isBlank()) {
            try { typeEnum = Order.OrderType.valueOf(orderType.toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }

        return ResponseEntity.ok(ApiResponse.ok(
                orderService.getAllOrders(pageable, statusEnum, typeEnum, search, from, to)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết đơn hàng theo ID")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderByIdAdmin(id)));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn hàng")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.updateOrderStatus(id, request.getStatus())));
    }

    @PutMapping("/{id}/assign-staff/{staffId}")
    @Operation(summary = "Gán nhân viên phụ trách đơn hàng")
    public ResponseEntity<ApiResponse<OrderDto>> assignStaff(
            @PathVariable Long id,
            @PathVariable Long staffId) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.assignStaff(id, staffId)));
    }
}
