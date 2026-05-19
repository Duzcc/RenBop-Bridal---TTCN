package com.renbobridal.module.order.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.order.dto.ReturnDto;
import com.renbobridal.module.order.dto.ReturnRequest;
import com.renbobridal.module.order.service.ReturnService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
@Tag(name = "Rental Return", description = "Endpoints for processing rental returns")
public class ReturnController {

    private final ReturnService returnService;

    /** [Admin] Lấy tất cả phiếu trả đồ */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Get all return records")
    public ResponseEntity<ApiResponse<List<ReturnDto>>> getAllReturns() {
        return ResponseEntity.ok(ApiResponse.ok(returnService.getAllReturns()));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "Get return record for an order")
    public ResponseEntity<ApiResponse<ReturnDto>> getReturnByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.ok(returnService.getReturnByOrderId(orderId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "Get return record by ID")
    public ResponseEntity<ApiResponse<ReturnDto>> getReturnById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(returnService.getReturnById(id)));
    }

    @PostMapping("/order/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Process a return for an order")
    public ResponseEntity<ApiResponse<ReturnDto>> processReturn(
            @PathVariable Long orderId,
            @RequestParam(required = false) Long staffId,
            @Valid @RequestBody ReturnRequest request) {
        ReturnDto created = returnService.processReturn(orderId, request, staffId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Ghi nhận trả đồ thành công", created));
    }
}
