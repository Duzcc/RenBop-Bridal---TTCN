package com.renbobridal.module.payment.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.order.entity.Order;
import com.renbobridal.module.order.service.OrderService;
import com.renbobridal.module.payment.service.VNPayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment", description = "Endpoints for payment processing")
public class PaymentController {

    private final VNPayService vnPayService;
    private final OrderService orderService;

    @PostMapping("/vnpay/create-url")
    @Operation(summary = "Create VNPay Payment URL")
    public ResponseEntity<ApiResponse<String>> createPaymentUrl(
            @RequestParam Long orderId,
            @RequestParam long amount,
            HttpServletRequest request) {
        
        String ipAddress = request.getRemoteAddr();
        String paymentUrl = vnPayService.createPaymentUrl(orderId, amount, ipAddress);
        
        return ResponseEntity.ok(ApiResponse.ok("URL generated", paymentUrl));
    }

    @GetMapping("/vnpay-return")
    @Operation(summary = "VNPay Return URL callback")
    public ResponseEntity<Void> vnpayReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
            fields.put(entry.getKey(), entry.getValue()[0]);
        }

        String vnp_ResponseCode = fields.get("vnp_ResponseCode");
        String vnp_TxnRef = fields.get("vnp_TxnRef");
        
        if (vnPayService.verifySignature(fields)) {
            if ("00".equals(vnp_ResponseCode)) {
                // Payment success
                Long orderId = Long.parseLong(vnp_TxnRef);
                log.info("Payment success for order {}", orderId);
                orderService.updateOrderStatus(orderId, Order.Status.IN_PROGRESS);
                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create("http://localhost:5173/payment-result?success=true&orderId=" + orderId))
                        .build();
            } else {
                // Payment failed
                log.warn("Payment failed for order {}", vnp_TxnRef);
                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create("http://localhost:5173/payment-result?success=false&orderId=" + vnp_TxnRef))
                        .build();
            }
        } else {
            log.error("Invalid VNPay signature for order {}", vnp_TxnRef);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("http://localhost:5173/payment-result?success=false&reason=invalid_signature"))
                    .build();
        }
    }
}
