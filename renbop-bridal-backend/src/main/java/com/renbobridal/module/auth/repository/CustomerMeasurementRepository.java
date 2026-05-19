package com.renbobridal.module.auth.repository;

import com.renbobridal.module.auth.entity.CustomerMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerMeasurementRepository extends JpaRepository<CustomerMeasurement, Long> {
    List<CustomerMeasurement> findByUserId(Long userId);
}
