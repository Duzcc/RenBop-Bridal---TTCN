package com.renbobridal.module.admin.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.auth.dto.AdminUpdateUserRequest;
import com.renbobridal.module.auth.dto.AuthResponse;
import com.renbobridal.module.auth.dto.UserStatsDto;
import com.renbobridal.module.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin User Management", description = "CRUD người dùng và phân quyền")
public class AdminUserController {

    private final UserService userService;

    /**
     * GET /api/admin/users
     * Lấy danh sách người dùng — hỗ trợ tìm kiếm và filter theo role.
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách người dùng (có filter & phân trang)")
    public ResponseEntity<ApiResponse<Page<UserStatsDto>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UserStatsDto> result = userService.searchUsers(role, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * GET /api/admin/users/{id}
     * Chi tiết người dùng kèm thống kê đơn hàng và chi tiêu.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết người dùng + thống kê đơn hàng")
    public ResponseEntity<ApiResponse<UserStatsDto>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserStats(id)));
    }

    /**
     * PUT /api/admin/users/{id}
     * Cập nhật thông tin cơ bản (tên, số điện thoại).
     */
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin người dùng (admin)")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(userService.adminUpdateUser(id, request)));
    }

    /**
     * PUT /api/admin/users/{id}/role
     * Đổi quyền (role) người dùng. Không thể promote lên ADMIN.
     */
    @PutMapping("/{id}/role")
    @Operation(summary = "Đổi quyền người dùng (CUSTOMER ↔ STAFF)")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        if (newRole == null || newRole.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<AuthResponse.UserDto>builder()
                            .success(false)
                            .message("Thiếu trường 'role'")
                            .code("BAD_REQUEST")
                            .build());
        }
        return ResponseEntity.ok(ApiResponse.ok(userService.updateUserRole(id, newRole)));
    }

    /**
     * DELETE /api/admin/users/{id}
     * Xóa người dùng (chỉ xóa được nếu không có đơn hàng nào).
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa người dùng (không có lịch sử đơn hàng)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    /**
     * GET /api/admin/users/staff
     * Lấy danh sách nhân viên để gán vào Fitting Session.
     */
    @GetMapping("/staff")
    @Operation(summary = "Danh sách nhân viên (STAFF + ADMIN) để gán lịch thử đồ")
    public ResponseEntity<ApiResponse<List<AuthResponse.UserDto>>> getStaffList() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getStaffList()));
    }
}
