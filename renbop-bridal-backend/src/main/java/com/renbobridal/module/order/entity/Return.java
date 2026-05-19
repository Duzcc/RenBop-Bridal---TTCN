package com.renbobridal.module.order.entity;

import com.renbobridal.module.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "returns")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Return {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /** Nhân viên tiếp nhận trả đồ */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_staff_id")
    private User receiverStaff;

    @Column(name = "return_date", nullable = false)
    private Instant returnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private Status status = Status.ON_TIME;

    @Column(name = "late_fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal lateFee = BigDecimal.ZERO;

    @OneToMany(mappedBy = "returnRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Damage> damages = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public enum Status {
        ON_TIME, // Trả đúng hạn
        LATE     // Trả trễ
    }
}
