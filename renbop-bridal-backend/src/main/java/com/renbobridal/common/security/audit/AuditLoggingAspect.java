package com.renbobridal.common.security.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
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

    // Intercept POST/PUT/DELETE/PATCH in all module controllers
    @Pointcut("execution(* com.renbobridal.module..controller.*.*(..)) " +
              "&& (@annotation(org.springframework.web.bind.annotation.PostMapping) " +
              "|| @annotation(org.springframework.web.bind.annotation.PutMapping) " +
              "|| @annotation(org.springframework.web.bind.annotation.DeleteMapping) " +
              "|| @annotation(org.springframework.web.bind.annotation.PatchMapping))")
    public void modifyEndpoints() {}

    @Around("modifyEndpoints()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        // 1. Capture previous state (args snapshot before execution)
        String previousValue = null;
        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                // Serialize first non-request arg as "previous" input
                for (Object arg : args) {
                    if (arg != null && !isServletType(arg)) {
                        previousValue = objectMapper.writeValueAsString(arg);
                        break;
                    }
                }
            }
        } catch (Exception ignored) {}

        // 2. Proceed with actual method
        Object result = joinPoint.proceed();

        // 3. Save audit log async-style (non-blocking on error)
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return result;
            }

            Long userId = null;
            if (auth.getPrincipal() instanceof Long id) {
                userId = id;
            }

            HttpServletRequest request = ((ServletRequestAttributes)
                    RequestContextHolder.currentRequestAttributes()).getRequest();

            String ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress == null) ipAddress = request.getRemoteAddr();

            String methodName = joinPoint.getSignature().getName();
            String className  = joinPoint.getTarget().getClass().getSimpleName();

            // Extract entity name (e.g. "OrderController" → "Order")
            String entityName = className.replace("Controller", "");

            // Try to serialize result as newValue
            String newValue = null;
            try {
                if (result != null) {
                    newValue = objectMapper.writeValueAsString(result);
                    // Truncate if too large
                    if (newValue.length() > 5000) newValue = newValue.substring(0, 5000) + "...";
                }
            } catch (Exception ignored) {}

            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .userEmail(auth.getName())
                    .action(request.getMethod() + "_" + methodName.toUpperCase())
                    .entityName(entityName)
                    .details("Method: " + methodName + " | Path: " + request.getRequestURI())
                    .previousValue(previousValue)
                    .newValue(newValue)
                    .ipAddress(ipAddress)
                    .isReverted(false)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit: Action={} User={} Entity={}", auditLog.getAction(), auditLog.getUserEmail(), entityName);

        } catch (Exception e) {
            log.error("Audit log failed: {}", e.getMessage());
        }

        return result;
    }

    private boolean isServletType(Object arg) {
        String cn = arg.getClass().getName();
        return cn.startsWith("jakarta.servlet") || cn.startsWith("javax.servlet")
                || cn.startsWith("org.springframework.web");
    }
}
