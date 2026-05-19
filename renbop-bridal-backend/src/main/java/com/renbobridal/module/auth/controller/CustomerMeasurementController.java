package com.renbobridal.module.auth.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.auth.dto.CustomerMeasurementDto;
import com.renbobridal.module.auth.dto.CustomerMeasurementRequest;
import com.renbobridal.module.auth.service.CustomerMeasurementService;
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
@RequestMapping("/api/measurements")
@RequiredArgsConstructor
@Tag(name = "Customer Measurement", description = "Endpoints for managing customer tailoring measurements")
public class CustomerMeasurementController {

    private final CustomerMeasurementService measurementService;

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or @securityService.isCurrentUser(#userId)")
    @Operation(summary = "Get all measurements for a specific user")
    public ResponseEntity<ApiResponse<List<CustomerMeasurementDto>>> getMeasurementsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(measurementService.getMeasurementsByUserId(userId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "Get measurement details by ID")
    public ResponseEntity<ApiResponse<CustomerMeasurementDto>> getMeasurementById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(measurementService.getMeasurementById(id)));
    }

    @PostMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Add new measurements for a user")
    public ResponseEntity<ApiResponse<CustomerMeasurementDto>> addMeasurement(
            @PathVariable Long userId,
            @Valid @RequestBody CustomerMeasurementRequest request) {
        CustomerMeasurementDto created = measurementService.addMeasurement(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm số đo thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Update measurements")
    public ResponseEntity<ApiResponse<CustomerMeasurementDto>> updateMeasurement(
            @PathVariable Long id,
            @Valid @RequestBody CustomerMeasurementRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật số đo thành công", measurementService.updateMeasurement(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Delete measurement record")
    public ResponseEntity<ApiResponse<Void>> deleteMeasurement(@PathVariable Long id) {
        measurementService.deleteMeasurement(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa số đo thành công"));
    }
}
