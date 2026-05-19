package com.renbobridal.module.product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "product_items", indexes = {
    @Index(name = "idx_productitem_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProductItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Mã định danh duy nhất cho sản phẩm vật lý (mã vạch / mã kho) */
    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(length = 20)
    private String size;

    @Column(length = 50)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private Status status = Status.AVAILABLE;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public enum Status {
        AVAILABLE,    // Có sẵn
        RENTED,       // Đang cho thuê
        MAINTENANCE,  // Đang bảo trì / sửa chữa
        DAMAGED,      // Hỏng hóc
        SOLD          // Đã bán
    }
}
