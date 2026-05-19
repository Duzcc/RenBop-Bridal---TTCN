package com.renbobridal.module.payment.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.payment.dto.PaymentDto;
import com.renbobridal.module.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
@Tag(name = "Admin Payment", description = "Admin endpoints for monitoring transactions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @Operation(summary = "Get all payment transactions")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getAllPaymentsAdmin()));
    }
}
