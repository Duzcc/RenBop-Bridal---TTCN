package com.renbobridal.module.order.repository;

import com.renbobridal.module.order.entity.Return;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnRepository extends JpaRepository<Return, Long> {
    Optional<Return> findByOrderId(Long orderId);
    List<Return> findByReceiverStaffId(Long staffId);
}
