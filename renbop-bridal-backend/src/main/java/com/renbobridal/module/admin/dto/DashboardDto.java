package com.renbobridal.module.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardDto {
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private Map<String, Long> statusCounts;
    private List<RecentOrderDto> recentOrders;

    // Thống kê hôm nay
    private long todayOrders;
    private BigDecimal todayRevenue;
    private long pendingOrders;
    private long upcomingFittings; // Lịch thử trong 7 ngày tới (đếm số lượng)
    private List<FittingDto> upcomingFittingsList; // Danh sách chi tiết

    // Biểu đồ doanh thu theo ngày
    private List<DailyRevenueDto> revenueChart;

    // Thống kê may đo đang thực hiện
    private long activeTailoringOrders;

    @Data
    @Builder
    public static class RecentOrderDto {
        private Long id;
        private BigDecimal totalAmount;
        private String status;
        private String orderType;
        private String customerName;
        private String createdAt;
    }

    @Data
    @Builder
    public static class FittingDto {
        private Long id;
        private String fittingDate;
        private String status;
        private String staffName;
        private Long tailoringOrderId;
    }

    @Data
    @Builder
    public static class DailyRevenueDto {
        private String date;         // "2025-05-19"
        private BigDecimal revenue;
        private long orderCount;
    }
}
