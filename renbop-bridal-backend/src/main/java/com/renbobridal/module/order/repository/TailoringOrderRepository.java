package com.renbobridal.module.order.repository;

import com.renbobridal.module.order.entity.TailoringOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TailoringOrderRepository extends JpaRepository<TailoringOrder, Long> {
    Optional<TailoringOrder> findByOrderItemId(Long orderItemId);

    /** Đếm đơn may đo chưa hoàn thành */
    long countByStatusNot(TailoringOrder.Status status);
}
