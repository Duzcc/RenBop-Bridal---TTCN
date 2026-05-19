package com.renbobridal.module.payment.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class VNPayConfig {
    @Value("${vnpay.tmn-code:}")
    private String vnpTmnCode;

    @Value("${vnpay.hash-secret:}")
    private String vnpHashSecret;

    @Value("${vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpPayUrl;

    @Value("${vnpay.return-url:http://localhost:8080/api/payments/vnpay-return}")
    private String vnpReturnUrl;
}
