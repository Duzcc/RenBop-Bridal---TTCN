package com.renbobridal.module.order.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.order.dto.DamageRequest;
import com.renbobridal.module.order.dto.ReturnDto.DamageDto;
import com.renbobridal.module.order.service.DamageService;
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
@RequestMapping("/api/damages")
@RequiredArgsConstructor
@Tag(name = "Rental Damage", description = "Endpoints for reporting damages on rented items")
public class DamageController {

    private final DamageService damageService;

    @GetMapping("/return/{returnId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "Get all damages reported for a return record")
    public ResponseEntity<ApiResponse<List<DamageDto>>> getDamagesByReturnId(@PathVariable Long returnId) {
        return ResponseEntity.ok(ApiResponse.ok(damageService.getDamagesByReturnId(returnId)));
    }

    @PostMapping("/return/{returnId}/product-item/{productItemId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "[Admin/Staff] Report damage for a returned item")
    public ResponseEntity<ApiResponse<DamageDto>> reportDamage(
            @PathVariable Long returnId,
            @PathVariable Long productItemId,
            @Valid @RequestBody DamageRequest request) {
        DamageDto created = damageService.reportDamage(returnId, productItemId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Báo cáo hư hỏng thành công", created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Remove a damage report")
    public ResponseEntity<ApiResponse<Void>> deleteDamage(@PathVariable Long id) {
        damageService.deleteDamage(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa báo cáo hư hỏng thành công"));
    }
}
