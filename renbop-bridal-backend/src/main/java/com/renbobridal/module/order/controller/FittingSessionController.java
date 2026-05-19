package com.renbobridal.module.order.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.order.dto.FittingSessionRequest;
import com.renbobridal.module.order.dto.TailoringOrderDto.FittingSessionDto;
import com.renbobridal.module.order.service.FittingSessionService;
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
@RequestMapping("/api/fitting-sessions")
@RequiredArgsConstructor
@Tag(name = "Fitting Session", description = "Endpoints for scheduling and managing bride fitting sessions")
public class FittingSessionController {

    private final FittingSessionService fittingSessionService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Get all fitting sessions with customer & product context")
    public ResponseEntity<ApiResponse<List<FittingSessionDto>>> getAllFittingSessions() {
        return ResponseEntity.ok(ApiResponse.ok(fittingSessionService.getAllFittingSessions()));
    }

    @GetMapping("/tailoring-order/{tailoringOrderId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "Get all fitting sessions for a tailoring order")
    public ResponseEntity<ApiResponse<List<FittingSessionDto>>> getSessionsByTailoringOrder(@PathVariable Long tailoringOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(fittingSessionService.getFittingSessionsByTailoringOrderId(tailoringOrderId)));
    }

    @PostMapping("/tailoring-order/{tailoringOrderId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Create a fitting session")
    public ResponseEntity<ApiResponse<FittingSessionDto>> createSession(
            @PathVariable Long tailoringOrderId,
            @RequestParam(required = false) Long staffId,
            @Valid @RequestBody FittingSessionRequest request) {
        FittingSessionDto created = fittingSessionService.createFittingSession(tailoringOrderId, request, staffId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đặt lịch thử đồ thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Update a fitting session details")
    public ResponseEntity<ApiResponse<FittingSessionDto>> updateSession(
            @PathVariable Long id,
            @RequestParam(required = false) Long staffId,
            @Valid @RequestBody FittingSessionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật lịch thử đồ thành công", fittingSessionService.updateFittingSession(id, request, staffId)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Cancel/Delete a fitting session")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable Long id) {
        fittingSessionService.deleteFittingSession(id);
        return ResponseEntity.ok(ApiResponse.ok("Hủy lịch thử đồ thành công"));
    }
}
