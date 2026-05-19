package com.renbobridal.module.order.entity;

import com.renbobridal.module.product.entity.ProductItem;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "order_items")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /**
     * Sản phẩm vật lý cụ thể trong kho.
     * Có thể null khi là đơn may đo mới (chưa có sản phẩm sẵn có trong kho).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_item_id")
    private ProductItem productItem;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    /** Ngày bắt đầu thuê (chỉ dùng cho đơn RENTAL) */
    @Column(name = "rental_start_date")
    private LocalDate rentalStartDate;

    /** Ngày kết thúc thuê (chỉ dùng cho đơn RENTAL) */
    @Column(name = "rental_end_date")
    private LocalDate rentalEndDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
}
