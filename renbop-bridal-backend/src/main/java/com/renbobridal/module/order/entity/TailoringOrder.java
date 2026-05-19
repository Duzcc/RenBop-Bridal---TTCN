package com.renbobridal.module.order.entity;

import com.renbobridal.module.auth.entity.CustomerMeasurement;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "tailoring_orders")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TailoringOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false, unique = true)
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "measurement_id")
    private CustomerMeasurement measurement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private Status status = Status.MEASURED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "expected_completion_date")
    private LocalDate expectedCompletionDate;

    @OneToMany(mappedBy = "tailoringOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FittingSession> fittingSessions = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    /** State Machine: trạng thái hợp lệ có thể chuyển sang từ trạng thái hiện tại */
    public enum Status {
        MEASURED  { @Override public Set<Status> allowedNext() { return EnumSet.of(CUTTING); } },
        CUTTING   { @Override public Set<Status> allowedNext() { return EnumSet.of(SEWING);  } },
        SEWING    { @Override public Set<Status> allowedNext() { return EnumSet.of(FITTING); } },
        FITTING   { @Override public Set<Status> allowedNext() { return EnumSet.of(DONE);    } },
        DONE      { @Override public Set<Status> allowedNext() { return EnumSet.noneOf(Status.class); } };

        public abstract Set<Status> allowedNext();

        public boolean canTransitionTo(Status next) {
            return allowedNext().contains(next);
        }

        public boolean isTerminal() {
            return this == DONE;
        }
    }
}

