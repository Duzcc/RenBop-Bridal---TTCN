package com.renbobridal.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("securityService")
public class SecurityService {

    /**
     * Kiểm tra xem userId truyền vào có khớp với userId đang đăng nhập hay không.
     * Dùng trong @PreAuthorize("@securityService.isCurrentUser(#userId)")
     * 
     * @param userId ID của người dùng cần kiểm tra
     * @return true nếu khớp, false nếu không hoặc chưa đăng nhập
     */
    public boolean isCurrentUser(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        
        // Trong JwtAuthFilter, chúng ta đang set principal là userId (Long)
        if (principal instanceof Long) {
            return principal.equals(userId);
        }
        
        return false;
    }
}
