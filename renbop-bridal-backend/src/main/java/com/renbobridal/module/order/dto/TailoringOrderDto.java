package com.renbobridal.module.order.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class TailoringOrderDto {
    private Long id;
    private Long orderItemId;
    private Long orderId;
    private String status;
    /** Danh sách trạng thái hợp lệ có thể chuyển sang tiếp theo (State Machine) */
    private List<String> allowedNextStatuses;
    private String notes;
    private LocalDate expectedCompletionDate;
    private String createdAt;
    private List<FittingSessionDto> fittingSessions;

    // Context fields for admin list view
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String productName;
    private String productSku;

    // Measurement snapshot (số đo tại thời điểm đặt đơn)
    private String bust;
    private String waist;
    private String hip;
    private String shoulder;
    private String armLength;

    @Data
    @Builder
    public static class FittingSessionDto {
        private Long id;
        private Long staffId;
        private String staffName;
        private String fittingDate;
        private String status;
        private String notes;

        // Context fields for admin list view
        private Long tailoringOrderId;
        private Long orderId;
        private String customerName;
        private String productName;
    }
}
