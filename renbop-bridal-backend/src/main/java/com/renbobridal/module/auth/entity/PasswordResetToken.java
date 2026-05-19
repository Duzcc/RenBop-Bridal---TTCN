package com.renbobridal.module.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    @Column(nullable = false)
    private Instant expiryDate;

    @CreatedDate
    @Column(updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (token == null) {
            token = UUID.randomUUID().toString();
        }
        if (expiryDate == null) {
            // Token expires in 15 minutes by default
            expiryDate = Instant.now().plus(15, ChronoUnit.MINUTES);
        }
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiryDate);
    }
}
