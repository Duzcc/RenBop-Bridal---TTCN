package com.renbobridal.module.auth.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.auth.dto.AuthResponse;
import com.renbobridal.module.auth.dto.LoginRequest;
import com.renbobridal.module.auth.dto.RegisterRequest;
import com.renbobridal.module.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Đăng ký thành công", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and get tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout — invalidate current refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal Long userId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        String token = null;
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7);
        }
        authService.logout(userId, token);
        return ResponseEntity.ok(ApiResponse.ok("Đăng xuất thành công"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<AuthResponse>builder()
                            .success(false)
                            .message("Missing token")
                            .code("UNAUTHORIZED")
                            .build());
        }
        String refreshToken = authorizationHeader.substring(7);
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.ok("Làm mới token thành công", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user info")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> getCurrentUser(@AuthenticationPrincipal Long userId) {
        AuthResponse.UserDto user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PutMapping("/me/profile")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> updateProfile(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody com.renbobridal.module.auth.dto.UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin thành công", authService.updateProfile(userId, request)));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody com.renbobridal.module.auth.dto.ChangePasswordRequest request) {
        authService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody com.renbobridal.module.auth.dto.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Nếu email của bạn tồn tại, một thông báo đã được gửi đến hộp thư."));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody com.renbobridal.module.auth.dto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập."));
    }

    @PostMapping("/2fa/verify")
    @Operation(summary = "Xác thực mã OTP 2FA để hoàn tất đăng nhập")
    public ResponseEntity<ApiResponse<AuthResponse>> verify2Fa(@Valid @RequestBody com.renbobridal.module.auth.dto.Verify2FaRequest request) {
        AuthResponse response = authService.verify2Fa(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }

    @PostMapping("/2fa/enable")
    @Operation(summary = "Bật/Tắt bảo mật 2 lớp 2FA cho tài khoản")
    public ResponseEntity<ApiResponse<Void>> toggle2Fa(
            @AuthenticationPrincipal Long userId,
            @RequestParam boolean enable) {
        authService.toggle2Fa(userId, enable);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái 2FA thành công"));
    }
}

