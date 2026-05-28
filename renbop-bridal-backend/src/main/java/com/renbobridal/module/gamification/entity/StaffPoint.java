package com.renbobridal.module.gamification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "staff_points")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StaffPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "total_points", nullable = false)
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "weekly_points", nullable = false)
    @Builder.Default
    private Integer weeklyPoints = 0;

    @Column(name = "monthly_points", nullable = false)
    @Builder.Default
    private Integer monthlyPoints = 0;

    @Column(name = "level", nullable = false)
    @Builder.Default
    private String level = "BRONZE";

    @Column(name = "week_start")
    private LocalDate weekStart;

    @Column(name = "month_start")
    private LocalDate monthStart;

    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        this.updatedAt = Instant.now();
    }
}
