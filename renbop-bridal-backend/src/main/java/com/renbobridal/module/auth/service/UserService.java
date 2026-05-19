package com.renbobridal.module.auth.service;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.module.auth.dto.AdminUpdateUserRequest;
import com.renbobridal.module.auth.dto.AuthResponse;
import com.renbobridal.module.auth.dto.UserStatsDto;
import com.renbobridal.module.auth.entity.User;
import com.renbobridal.module.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    // ── Admin: Danh sách người dùng ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AuthResponse.UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToDto);
    }

    /**
     * Tìm kiếm người dùng có filter theo role và keyword tên/email.
     * @param role   nullable — nếu null thì tìm tất cả role
     * @param search nullable — nếu null thì không lọc từ khoá
     */
    @Transactional(readOnly = true)
    public Page<UserStatsDto> searchUsers(String role, String search, Pageable pageable) {
        User.Role roleEnum = null;
        if (role != null && !role.isBlank() && !role.equalsIgnoreCase("ALL")) {
            try {
                roleEnum = User.Role.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }
        String searchTerm = (search != null && !search.isBlank()) 
                ? "%" + search.trim().toLowerCase() + "%" 
                : null;

        return userRepository.findAllByRoleAndSearch(roleEnum, searchTerm, pageable)
                .map(this::mapToStatsDto);
    }

    // ── Admin: Chi tiết người dùng ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public UserStatsDto getUserStats(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return mapToStatsDto(user);
    }

    // ── Admin: Cập nhật thông tin ────────────────────────────────────────────

    @Transactional
    public AuthResponse.UserDto adminUpdateUser(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole() == User.Role.ADMIN) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        user.setFullName(request.getName());
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }
        log.info("[ADMIN] Updated user id={} name={}", id, request.getName());
        return mapToDto(userRepository.save(user));
    }

    // ── Admin: Đổi quyền ────────────────────────────────────────────────────

    @Transactional
    public AuthResponse.UserDto updateUserRole(Long id, String newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole() == User.Role.ADMIN) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        User.Role role;
        try {
            role = User.Role.valueOf(newRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        if (role == User.Role.ADMIN) {
            throw new AppException(ErrorCode.FORBIDDEN); // Không cho promote lên ADMIN qua API
        }

        user.setRole(role);
        log.info("[ADMIN] Changed role of userId={} to {}", id, role);
        return mapToDto(userRepository.save(user));
    }

    // ── Admin: Xóa người dùng ───────────────────────────────────────────────

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole() == User.Role.ADMIN) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Kiểm tra user có đơn hàng đang chờ/xử lý không
        long activeOrders = userRepository.countOrdersByUserId(id);
        if (activeOrders > 0) {
            log.warn("[ADMIN] Attempt to delete userId={} who has {} orders", id, activeOrders);
            throw new AppException(ErrorCode.BAD_REQUEST); // "Không thể xóa khách có lịch sử đơn hàng"
        }

        log.info("[ADMIN] Deleted userId={}", id);
        userRepository.delete(user);
    }

    // ── Admin: Danh sách nhân viên ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AuthResponse.UserDto> getStaffList() {
        return userRepository.findByRoleIn(List.of(User.Role.STAFF, User.Role.ADMIN))
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private AuthResponse.UserDto mapToDto(User user) {
        return AuthResponse.UserDto.builder()
                .id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    private UserStatsDto mapToStatsDto(User user) {
        long totalOrders    = userRepository.countOrdersByUserId(user.getId());
        BigDecimal spending = userRepository.calculateTotalSpending(user.getId());
        if (spending == null) spending = BigDecimal.ZERO;

        return UserStatsDto.builder()
                .id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .totalOrders(totalOrders)
                .totalSpending(spending)
                .build();
    }
}
