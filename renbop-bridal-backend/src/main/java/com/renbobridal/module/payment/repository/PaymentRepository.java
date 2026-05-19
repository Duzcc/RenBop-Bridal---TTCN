package com.renbobridal.module.payment.repository;

import com.renbobridal.module.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByOrderId(Long orderId);

    Optional<Payment> findTopByOrderIdOrderByCreatedAtDesc(Long orderId);

    boolean existsByOrderIdAndStatus(Long orderId, Payment.Status status);
}
