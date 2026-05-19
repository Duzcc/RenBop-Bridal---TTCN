package com.renbobridal.module.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "customer_measurements")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CustomerMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Tên/nhãn phiên đo (VD: "Váy cưới tháng 6", "Đo lần 1")
    @Column(name = "label")
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    @Builder.Default
    private Gender gender = Gender.FEMALE;

    public enum Gender {
        MALE, FEMALE
    }

    @Column(precision = 5, scale = 2)
    private BigDecimal bust;

    @Column(precision = 5, scale = 2)
    private BigDecimal waist;

    @Column(precision = 5, scale = 2)
    private BigDecimal hip;

    @Column(precision = 5, scale = 2)
    private BigDecimal shoulder;

    @Column(name = "arm_length", precision = 5, scale = 2)
    private BigDecimal armLength;

    @Column(columnDefinition = "TEXT")
    private String note;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
}
