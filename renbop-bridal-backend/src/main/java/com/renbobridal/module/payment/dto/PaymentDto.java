package com.renbobridal.module.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDto {
    private Long id;
    private Long orderId;
    private String customerName;
    private String method; // Tương thích với code cũ trong service
    private String status;
    private BigDecimal amount;
    private String transactionId;
    private Instant createdAt;
    
    // Thông tin bổ sung cho frontend hiển thị QR/Link
    private GatewayInfo gatewayInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GatewayInfo {
        private String qrCodeUrl;
        private String approvalUrl;
        private String deeplink;
        private String instruction;
    }
}
