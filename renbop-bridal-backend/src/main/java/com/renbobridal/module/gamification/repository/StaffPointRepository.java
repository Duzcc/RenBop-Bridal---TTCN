package com.renbobridal.module.gamification.repository;

import com.renbobridal.module.gamification.entity.StaffPoint;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffPointRepository extends JpaRepository<StaffPoint, Long> {
    Optional<StaffPoint> findByUserId(Long userId);

    @Query("SELECT sp FROM StaffPoint sp JOIN User u ON sp.userId = u.id ORDER BY sp.weeklyPoints DESC")
    List<StaffPoint> findTopByWeeklyPointsDesc(Pageable pageable);

    @Query("SELECT sp FROM StaffPoint sp JOIN User u ON sp.userId = u.id ORDER BY sp.totalPoints DESC")
    List<StaffPoint> findTopByTotalPointsDesc(Pageable pageable);
}
