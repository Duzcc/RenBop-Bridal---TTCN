package com.renbobridal.module.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tempToken; // Dành cho 2FA
    private boolean requires2Fa; // Flag để client biết cần nhập mã OTP
    private UserDto user;

    @Data
    @Builder
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String role;
        private boolean is2FaEnabled;
    }
}
