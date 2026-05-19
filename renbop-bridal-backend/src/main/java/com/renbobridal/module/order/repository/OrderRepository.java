package com.renbobridal.module.order.repository;

import com.renbobridal.module.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    @EntityGraph(attributePaths = {"items", "items.productItem", "items.productItem.product", "customer", "staff"})
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    @EntityGraph(attributePaths = {"items", "items.productItem", "items.productItem.product", "customer", "staff"})
    Page<Order> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"items", "items.productItem", "items.productItem.product", "customer", "staff"})
    Page<Order> findByStatus(Order.Status status, Pageable pageable);

    @EntityGraph(attributePaths = {"items", "items.productItem", "items.productItem.product", "customer", "staff"})
    Page<Order> findByOrderType(Order.OrderType orderType, Pageable pageable);

    @EntityGraph(attributePaths = {"items", "items.productItem", "items.productItem.product", "customer", "staff"})
    Page<Order> findByStatusAndOrderType(Order.Status status, Order.OrderType orderType, Pageable pageable);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();

    List<Order> findTop7ByStatusNotOrderByCreatedAtDesc(Order.Status status);

    // ── Dashboard queries ────────────────────────────────────────────────────

    /** Đơn hàng được tạo trong khoảng thời gian [from, to] */
    long countByCreatedAtBetween(Instant from, Instant to);

    /** Doanh thu trong khoảng thời gian (không tính cancelled) */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.status != com.renbobridal.module.order.entity.Order.Status.CANCELLED " +
           "AND o.createdAt BETWEEN :from AND :to")
    BigDecimal calculateRevenueBetween(@Param("from") Instant from, @Param("to") Instant to);

    /** Đếm đơn đang chờ xử lý */
    long countByStatus(Order.Status status);

    /**
     * Doanh thu gom theo ngày (UTC truncated to day).
     * Trả về Object[]{java.sql.Date date, BigDecimal revenue, Long count}
     */
    @Query(value = """
            SELECT DATE(o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') AS day,
                   COALESCE(SUM(o.total_amount), 0) AS revenue,
                   COUNT(o.id) AS order_count
            FROM orders o
            WHERE o.status <> 'CANCELLED'
              AND o.created_at >= :from
              AND o.created_at <  :to
            GROUP BY day
            ORDER BY day ASC
            """, nativeQuery = true)
    List<Object[]> findDailyRevenue(@Param("from") Instant from, @Param("to") Instant to);
}

