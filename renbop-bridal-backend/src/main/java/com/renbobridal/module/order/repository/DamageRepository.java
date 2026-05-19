package com.renbobridal.module.order.repository;

import com.renbobridal.module.order.entity.Damage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DamageRepository extends JpaRepository<Damage, Long> {
    List<Damage> findByReturnRecordId(Long returnId);
    List<Damage> findByProductItemId(Long productItemId);
}
