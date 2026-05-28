package com.renbobridal.module.auth.repository;

import com.renbobridal.module.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // ── Admin queries ────────────────────────────────────────────────────────

    /** Tìm kiếm theo tên hoặc email (case-insensitive) */
    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE :search " +
           " OR LOWER(u.email) LIKE :search)")
    Page<User> findAllByRoleAndSearch(
            @Param("role") User.Role role,
            @Param("search") String search,
            Pageable pageable);

    /** Lấy danh sách nhân viên (STAFF + ADMIN) để gán vào fitting */
    List<User> findByRoleIn(List<User.Role> roles);

    /** Tổng chi tiêu của 1 khách hàng (tổng tất cả đơn không cancelled) */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.customer.id = :userId AND o.status != com.renbobridal.module.order.entity.Order.Status.CANCELLED")
    java.math.BigDecimal calculateTotalSpending(@Param("userId") Long userId);

    /** Tổng số đơn hàng của 1 khách hàng */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.customer.id = :userId")
    long countOrdersByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(u) FROM User u WHERE " +
           "(cast(:from as timestamp) IS NULL OR u.createdAt >= :from) " +
           "AND (cast(:to as timestamp) IS NULL OR u.createdAt <= :to)")
    long countUsers(@Param("from") Instant from, @Param("to") Instant to);
}
