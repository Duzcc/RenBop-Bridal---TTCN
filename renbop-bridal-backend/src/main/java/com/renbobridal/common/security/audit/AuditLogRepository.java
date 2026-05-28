package com.renbobridal.common.security.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Timeline: latest 50 logs
    List<AuditLog> findTop50ByOrderByCreatedAtDesc();

    // Paginated with optional filters
    @Query("""
        SELECT a FROM AuditLog a
        WHERE (:entityName IS NULL OR a.entityName = :entityName)
          AND (:action IS NULL OR a.action LIKE %:action%)
          AND (:userId IS NULL OR a.userId = :userId)
          AND (:from IS NULL OR a.createdAt >= :from)
          AND (:to IS NULL OR a.createdAt <= :to)
        ORDER BY a.createdAt DESC
        """)
    Page<AuditLog> findFiltered(
            @Param("entityName") String entityName,
            @Param("action")     String action,
            @Param("userId")     Long userId,
            @Param("from")       Instant from,
            @Param("to")         Instant to,
            Pageable pageable
    );

    // Find by specific entity for undo context
    List<AuditLog> findByEntityNameAndEntityIdOrderByCreatedAtDesc(String entityName, String entityId);

    // Find revertible logs for a user (not yet reverted)
    List<AuditLog> findTop5ByUserIdAndIsRevertedFalseOrderByCreatedAtDesc(Long userId);
}
