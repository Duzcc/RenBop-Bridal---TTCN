package com.renbobridal.module.auth.service;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.common.util.JwtUtil;
import com.renbobridal.module.auth.dto.AuthResponse;
import com.renbobridal.module.auth.dto.LoginRequest;
import com.renbobridal.module.auth.dto.RegisterRequest;
import com.renbobridal.module.auth.entity.PasswordResetToken;
import com.renbobridal.module.auth.entity.User;
import com.renbobridal.module.auth.repository.PasswordResetTokenRepository;
import com.renbobridal.module.auth.repository.UserRepository;
import com.renbobridal.common.service.EmailService;
import com.renbobridal.common.security.LoginAttemptService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final LoginAttemptService loginAttemptService;

    @Value("${SMTP_USERNAME:vduc31100@gmail.com}")
    private String adminFallbackEmail;

    /** In-memory token blacklist — reset khi restart server (đủ dùng cho trường học) */
    private final Set<String> tokenBlacklist = Collections.newSetFromMap(new ConcurrentHashMap<>());

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .fullName(request.getName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.CUSTOMER)
                .build();

        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String emailKey = request.getEmail().toLowerCase();
        
        if (loginAttemptService.isBlocked(emailKey)) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }

        User user = userRepository.findByEmail(emailKey)
                .orElseThrow(() -> {
                    loginAttemptService.loginFailed(emailKey);
                    return new AppException(ErrorCode.INVALID_CREDENTIALS);
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            loginAttemptService.loginFailed(emailKey);
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        loginAttemptService.loginSucceeded(emailKey);

        if (user.is2FaEnabled()) {
            return generateAndSend2FaCode(user);
        }

        return buildAuthResponse(user);
    }

    private AuthResponse generateAndSend2FaCode(User user) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setTwoFactorCode(otp);
        user.setTwoFactorExpiry(Instant.now().plus(5, ChronoUnit.MINUTES));
        userRepository.save(user);

        log.info("[2FA OTP] Mã xác nhận 2FA của user {} là: {}", user.getEmail(), otp);

        String targetEmail = user.getRole() == User.Role.ADMIN ? adminFallbackEmail : user.getEmail();

        // Send OTP via email
        emailService.sendCustomEmail(
            targetEmail, 
            "Mã xác nhận 2FA",
            "Mã xác nhận 2FA - Renbo Bridal", 
            "<p style='font-size:16px;'>Mã OTP của bạn là: <strong style='font-size:24px;color:#c8a96e;letter-spacing:2px;'>" + otp + "</strong></p><p>Mã này sẽ hết hạn sau 5 phút.</p>"
        );

        String tempToken = jwtUtil.generateTempToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .requires2Fa(true)
                .tempToken(tempToken)
                .build();
    }

    @Transactional
    public AuthResponse verify2Fa(com.renbobridal.module.auth.dto.Verify2FaRequest request) {
        if (!jwtUtil.isTempToken(request.getTempToken())) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        Long userId = jwtUtil.getUserIdFromToken(request.getTempToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getTwoFactorExpiry() == null || Instant.now().isAfter(user.getTwoFactorExpiry())) {
            throw new AppException(ErrorCode.INVALID_TOKEN); // or OTP_EXPIRED
        }

        if (!request.getCode().equals(user.getTwoFactorCode())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // OTP valid, clear it and return full token
        user.setTwoFactorCode(null);
        user.setTwoFactorExpiry(null);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Transactional
    public void toggle2Fa(Long userId, boolean enable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.set2FaEnabled(enable);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.isRefreshToken(refreshToken)) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        // Kiểm tra token có bị blacklist (đã logout) không
        if (tokenBlacklist.contains(refreshToken)) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        Long userId = jwtUtil.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return buildAuthResponse(user);
    }

    /**
     * Logout — đưa token vào blacklist.
     * Token sẽ bị từ chối ở endpoint /refresh kể từ đây.
     */
    public void logout(Long userId, String token) {
        if (token != null && !token.isBlank()) {
            tokenBlacklist.add(token);
            log.info("[AUTH] User id={} logged out. Token blacklisted.", userId);
        } else {
            log.info("[AUTH] User id={} logged out (no token to blacklist).", userId);
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return buildUserDto(user);
    }

    @Transactional
    public AuthResponse.UserDto updateProfile(Long userId, com.renbobridal.module.auth.dto.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        user.setFullName(request.getName());
        return buildUserDto(userRepository.save(user));
    }

    @Transactional
    public void changePassword(Long userId, com.renbobridal.module.auth.dto.ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(com.renbobridal.module.auth.dto.ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Xóa token cũ nếu có
        passwordResetTokenRepository.deleteByUser(user);

        // Tạo token mới
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .build();
        passwordResetTokenRepository.save(resetToken);

        // Gửi email
        String targetEmail = user.getRole() == User.Role.ADMIN ? adminFallbackEmail : user.getEmail();
        emailService.sendPasswordResetEmail(targetEmail, resetToken.getToken());
    }

    @Transactional
    public void resetPassword(com.renbobridal.module.auth.dto.ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Xóa token sau khi dùng
        passwordResetTokenRepository.delete(resetToken);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(buildUserDto(user))
                .build();
    }

    private AuthResponse.UserDto buildUserDto(User user) {
        return AuthResponse.UserDto.builder()
                .id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .is2FaEnabled(user.is2FaEnabled())
                .build();
    }
}
