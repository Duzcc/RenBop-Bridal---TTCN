package com.renbobridal.module.order.repository;

import com.renbobridal.module.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi FROM OrderItem oi JOIN oi.order o WHERE o.orderType = 'RENTAL' AND oi.rentalEndDate < :today AND oi.productItem IS NOT NULL AND oi.productItem.status = 'RENTED'")
    List<OrderItem> findExpiredRentals(@Param("today") LocalDate today);
}
