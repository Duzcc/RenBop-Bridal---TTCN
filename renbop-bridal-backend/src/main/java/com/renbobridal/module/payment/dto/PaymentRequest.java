package com.renbobridal.module.payment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentRequest {

    /**
     * Phương thức thanh toán: COD | VIETQR | MOMO | PAYPAL
     */
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String method;

    /**
     * Dành cho giả lập: true = thanh toán thành công / false = thất bại
     * Trong production sẽ thay bằng webhook/callback từ gateway
     */
    private boolean simulateSuccess = true;
}
