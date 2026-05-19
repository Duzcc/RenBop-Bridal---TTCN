package com.renbobridal.module.order.repository;

import com.renbobridal.module.order.entity.FittingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface FittingSessionRepository extends JpaRepository<FittingSession, Long> {
    List<FittingSession> findByTailoringOrderId(Long tailoringOrderId);
    List<FittingSession> findByStaffId(Long staffId);

    /** Đếm lịch thử đồ sắp tới (SCHEDULED) trong khoảng thời gian */
    @Query("SELECT COUNT(f) FROM FittingSession f " +
           "WHERE f.status = com.renbobridal.module.order.entity.FittingSession.Status.SCHEDULED " +
           "AND f.fittingDate BETWEEN :from AND :to")
    long countUpcomingFittings(@Param("from") Instant from, @Param("to") Instant to);

    @Query("SELECT f FROM FittingSession f " +
           "WHERE f.status = com.renbobridal.module.order.entity.FittingSession.Status.SCHEDULED " +
           "AND f.fittingDate BETWEEN :from AND :to ORDER BY f.fittingDate ASC")
    List<FittingSession> findUpcomingFittings(@Param("from") Instant from, @Param("to") Instant to);
}
