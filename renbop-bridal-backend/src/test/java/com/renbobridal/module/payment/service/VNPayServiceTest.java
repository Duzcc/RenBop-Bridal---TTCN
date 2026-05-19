package com.renbobridal.module.payment.service;

import com.renbobridal.module.payment.config.VNPayConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VNPayServiceTest {

    @Mock
    private VNPayConfig vnPayConfig;

    @InjectMocks
    private VNPayService vnPayService;

    @BeforeEach
    void setUp() {
        when(vnPayConfig.getVnpHashSecret()).thenReturn("SECRETKEY1234567890");
    }

    @Test
    void verifySignature_ValidSignature_ReturnsTrue() throws Exception {
        // Arrange
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "1000000");
        params.put("vnp_Command", "pay");
        params.put("vnp_OrderInfo", "Thanh toan 123");
        
        // Tạo query string
        String hashData = "vnp_Amount=1000000&vnp_Command=pay&vnp_OrderInfo=" + URLEncoder.encode("Thanh toan 123", StandardCharsets.US_ASCII.toString());
        
        // Tính mã băm giả lập
        java.lang.reflect.Method hmacSHA512 = VNPayService.class.getDeclaredMethod("hmacSHA512", String.class, String.class);
        hmacSHA512.setAccessible(true);
        String expectedHash = (String) hmacSHA512.invoke(vnPayService, "SECRETKEY1234567890", hashData);

        params.put("vnp_SecureHash", expectedHash);

        // Act
        boolean result = vnPayService.verifySignature(params);

        // Assert
        assertTrue(result, "Signature should be valid");
    }

    @Test
    void verifySignature_InvalidSignature_ReturnsFalse() {
        // Arrange
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "1000000");
        params.put("vnp_Command", "pay");
        params.put("vnp_OrderInfo", "Thanh toan 123");
        params.put("vnp_SecureHash", "invalid_hash_string");

        // Act
        boolean result = vnPayService.verifySignature(params);

        // Assert
        assertFalse(result, "Signature should be invalid");
    }
}
