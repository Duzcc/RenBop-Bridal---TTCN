package com.renbobridal.common.util;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Slf4j
@Component
public class JwtUtil {

    private final SecretKey key;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-expiration-ms}") long accessExpirationMs,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    // ── Generate ─────────────────────────────────────────────

    public String generateAccessToken(Long userId, String email, String role) {
        return buildToken(userId, email, role, accessExpirationMs, "access");
    }

    public String generateRefreshToken(Long userId, String email, String role) {
        return buildToken(userId, email, role, refreshExpirationMs, "refresh");
    }

    public String generateTempToken(Long userId, String email, String role) {
        // Temp token for 2FA validation, valid for 5 minutes
        return buildToken(userId, email, role, 5 * 60 * 1000, "temp");
    }

    private String buildToken(Long userId, String email, String role, long expirationMs, String type) {
        return Jwts.builder()
                .subject(userId.toString())
                .claims(Map.of("email", email, "role", role, "type", type))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    // ── Parse ─────────────────────────────────────────────────

    public Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException | UnsupportedJwtException |
                 MalformedJwtException | SecurityException | IllegalArgumentException e) {
            log.debug("Invalid JWT: {}", e.getMessage());
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    public Long getUserIdFromToken(String token) {
        return Long.parseLong(parseToken(token).getSubject());
    }

    public String getEmailFromToken(String token) {
        return parseToken(token).get("email", String.class);
    }

    public String getRoleFromToken(String token) {
        return parseToken(token).get("role", String.class);
    }

    public boolean isAccessToken(String token) {
        return "access".equals(parseToken(token).get("type", String.class));
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(parseToken(token).get("type", String.class));
    }

    public boolean isTempToken(String token) {
        return "temp".equals(parseToken(token).get("type", String.class));
    }

    /**
     * Lấy userId từ email (username trong UserDetails).
     * UserDetails.getUsername() trả về email — subject của token là userId,
     * nên cần dùng UserRepository. Thay thế: inject trực tiếp từ SecurityContext.
     * Đây là method tiện lợi khi controller nhận UserDetails.
     */
    public Long getUserIdFromUsername(String email) {
        // email == subject? Không — subject là userId. Method này parse lại không được.
        // Cách đúng: dùng @AuthenticationPrincipal với custom UserDetails.
        // Placeholder ném exception để dev biết cần dùng JwtAuthFilter userId attribute.
        throw new UnsupportedOperationException(
            "Dùng SecurityContextHolder hoặc @AuthenticationPrincipal UserDetails + UserRepository thay vì method này"
        );
    }
}
