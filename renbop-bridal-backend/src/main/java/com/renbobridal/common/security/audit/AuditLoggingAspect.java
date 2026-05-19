package com.renbobridal.common.security.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditLoggingAspect {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    // Intercept methods in admin or staff controllers that modify data (Post, Put, Delete, Patch)
    @Pointcut("execution(* com.renbobridal.module..controller.*.*(..)) " +
              "&& (@annotation(org.springframework.web.bind.annotation.PostMapping) " +
              "|| @annotation(org.springframework.web.bind.annotation.PutMapping) " +
              "|| @annotation(org.springframework.web.bind.annotation.DeleteMapping) " +
              "|| @annotation(org.springframework.web.bind.annotation.PatchMapping))")
    public void modifyEndpoints() {}

    @AfterReturning(pointcut = "modifyEndpoints()", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return; // Not logged in
            }

            Long userId = null;
            if (auth.getPrincipal() instanceof Long) {
                userId = (Long) auth.getPrincipal();
            }

            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress == null) {
                ipAddress = request.getRemoteAddr();
            }

            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            
            // Khởi tạo chi tiết arguments (bỏ qua các objects quá lớn hoặc Request/Response objects)
            StringBuilder details = new StringBuilder();
            details.append("Method: ").append(methodName).append(". ");
            
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .userEmail(auth.getName())
                    .action(request.getMethod() + "_" + methodName.toUpperCase())
                    .entityName(className)
                    .details(details.toString())
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log saved: Action={}, User={}", auditLog.getAction(), auditLog.getUserId());

        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage());
        }
    }
}
