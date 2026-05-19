package com.renbobridal.module.auth.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

/** DTO trả về chi tiết user kèm thống kê tổng đơn và chi tiêu — dùng cho admin */
@Data
@Builder
public class UserStatsDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String createdAt;

    // Thống kê
    private long totalOrders;
    private BigDecimal totalSpending;
}
