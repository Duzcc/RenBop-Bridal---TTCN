package com.renbobridal.module.auth.service;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.security.LoginAttemptService;
import com.renbobridal.common.service.EmailService;
import com.renbobridal.common.util.JwtUtil;
import com.renbobridal.module.auth.dto.AuthResponse;
import com.renbobridal.module.auth.dto.LoginRequest;
import com.renbobridal.module.auth.entity.User;
import com.renbobridal.module.auth.repository.PasswordResetTokenRepository;
import com.renbobridal.module.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private LoginAttemptService loginAttemptService;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_Success_Without2FA() {
        // Arrange
        LoginRequest request = new LoginRequest("test@gmail.com", "password123");
        User user = User.builder()
                .id(1L)
                .email("test@gmail.com")
                .password("encodedPassword")
                .role(User.Role.CUSTOMER)
                .is2FaEnabled(false)
                .build();

        when(loginAttemptService.isBlocked("test@gmail.com")).thenReturn(false);
        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateAccessToken(1L, "test@gmail.com", "CUSTOMER")).thenReturn("accessToken");
        when(jwtUtil.generateRefreshToken(1L, "test@gmail.com", "CUSTOMER")).thenReturn("refreshToken");

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertFalse(response.isRequires2Fa());
        verify(loginAttemptService).loginSucceeded("test@gmail.com");
    }

    @Test
    void login_Success_With2FA_ReturnsTempToken() {
        // Arrange
        LoginRequest request = new LoginRequest("test@gmail.com", "password123");
        User user = User.builder()
                .id(1L)
                .email("test@gmail.com")
                .password("encodedPassword")
                .role(User.Role.CUSTOMER)
                .is2FaEnabled(true)
                .build();

        when(loginAttemptService.isBlocked("test@gmail.com")).thenReturn(false);
        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateTempToken(1L, "test@gmail.com", "CUSTOMER")).thenReturn("tempToken");

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertTrue(response.isRequires2Fa());
        assertEquals("tempToken", response.getTempToken());
        verify(emailService).sendCustomEmail(anyString(), anyString(), anyString(), anyString());
        verify(userRepository).save(user);
    }

    @Test
    void login_AccountLocked_ThrowsException() {
        // Arrange
        LoginRequest request = new LoginRequest("test@gmail.com", "password123");
        when(loginAttemptService.isBlocked("test@gmail.com")).thenReturn(true);

        // Act & Assert
        assertThrows(AppException.class, () -> authService.login(request));
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void login_WrongPassword_ThrowsExceptionAndRecordsFailedAttempt() {
        // Arrange
        LoginRequest request = new LoginRequest("test@gmail.com", "wrongPassword");
        User user = User.builder().email("test@gmail.com").password("encodedPassword").build();

        when(loginAttemptService.isBlocked("test@gmail.com")).thenReturn(false);
        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        // Act & Assert
        assertThrows(AppException.class, () -> authService.login(request));
        verify(loginAttemptService).loginFailed("test@gmail.com");
    }
}
