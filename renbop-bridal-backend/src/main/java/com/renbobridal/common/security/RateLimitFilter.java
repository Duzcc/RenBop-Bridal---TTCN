package com.renbobridal.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.common.response.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    // Cache bucket theo IP cho API thường (100 req/min)
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    // Cache bucket theo IP cho Auth API (5 req/min)
    private final Map<String, Bucket> authCache = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        Refill refill = Refill.greedy(100, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(100, refill);
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createAuthBucket() {
        Refill refill = Refill.greedy(5, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(5, refill);
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket resolveBucket(HttpServletRequest request, boolean isAuthApi) {
        String clientIp = request.getRemoteAddr();
        String proxyIp = request.getHeader("X-Forwarded-For");
        String key = proxyIp != null ? proxyIp : clientIp;
        
        if (isAuthApi) {
            return authCache.computeIfAbsent(key, k -> createAuthBucket());
        }
        return cache.computeIfAbsent(key, k -> createNewBucket());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            
        // Áp dụng Rate Limit cho tất cả API bắt đầu bằng /api/
        if (!request.getRequestURI().startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        boolean isAuthApi = request.getRequestURI().startsWith("/api/auth/login") || 
                            request.getRequestURI().startsWith("/api/auth/register");
                            
        Bucket bucket = resolveBucket(request, isAuthApi);
        
        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for IP: {}", request.getRemoteAddr());
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), 
                ApiResponse.error("Bạn thao tác quá nhanh, vui lòng thử lại sau.", "TOO_MANY_REQUESTS"));
        }
    }
}
