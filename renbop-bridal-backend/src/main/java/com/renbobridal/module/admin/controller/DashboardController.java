package com.renbobridal.module.admin.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.admin.dto.DashboardDto;
import com.renbobridal.module.auth.repository.UserRepository;
import com.renbobridal.module.order.entity.FittingSession;
import com.renbobridal.module.order.entity.Order;
import com.renbobridal.module.order.entity.TailoringOrder;
import com.renbobridal.module.order.repository.FittingSessionRepository;
import com.renbobridal.module.order.repository.OrderRepository;
import com.renbobridal.module.order.repository.TailoringOrderRepository;
import com.renbobridal.module.product.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Dashboard", description = "Endpoints for admin statistics and reports")
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final FittingSessionRepository fittingSessionRepository;
    private final TailoringOrderRepository tailoringOrderRepository;

    @GetMapping
    @Operation(summary = "Get overall dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardDto>> getDashboardStats() {
        long totalUsers    = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders   = orderRepository.count();
        BigDecimal totalRevenue = Optional.ofNullable(orderRepository.calculateTotalRevenue())
                .orElse(BigDecimal.ZERO);

        // Status counts
        List<Object[]> counts = orderRepository.countOrdersByStatus();
        Map<String, Long> statusCounts = new HashMap<>();
        for (Object[] row : counts) {
            Order.Status status = (Order.Status) row[0];
            Long count = (Long) row[1];
            statusCounts.put(status.name(), count);
        }
        for (Order.Status status : Order.Status.values()) {
            statusCounts.putIfAbsent(status.name(), 0L);
        }

        // Recent orders (top 7, not cancelled)
        List<Order> recentOrdersList = orderRepository.findTop7ByStatusNotOrderByCreatedAtDesc(Order.Status.CANCELLED);
        List<DashboardDto.RecentOrderDto> recentOrders = recentOrdersList.stream()
                .map(o -> DashboardDto.RecentOrderDto.builder()
                        .id(o.getId())
                        .totalAmount(o.getTotalAmount())
                        .status(o.getStatus().name())
                        .orderType(o.getOrderType().name())
                        .customerName(o.getCustomer() != null ? o.getCustomer().getFullName() : "N/A")
                        .createdAt(o.getCreatedAt() != null ? o.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());

        // Today stats (Vietnam timezone)
        ZonedDateTime todayStart = LocalDate.now(VN_ZONE).atStartOfDay(VN_ZONE);
        ZonedDateTime todayEnd   = todayStart.plusDays(1);
        Instant todayStartInst   = todayStart.toInstant();
        Instant todayEndInst     = todayEnd.toInstant();

        long todayOrders      = orderRepository.countByCreatedAtBetween(todayStartInst, todayEndInst);
        BigDecimal todayRev   = Optional.ofNullable(orderRepository.calculateRevenueBetween(todayStartInst, todayEndInst))
                .orElse(BigDecimal.ZERO);
        long pendingOrders    = orderRepository.countByStatus(Order.Status.PENDING);

        // Upcoming fittings (next 7 days)
        Instant now       = Instant.now();
        Instant sevenDays = now.plus(7, java.time.temporal.ChronoUnit.DAYS);
        long upcomingFit  = fittingSessionRepository.countUpcomingFittings(now, sevenDays);
        List<FittingSession> upcomingFitList = fittingSessionRepository.findUpcomingFittings(now, sevenDays);
        List<DashboardDto.FittingDto> fitDtos = upcomingFitList.stream().map(f -> 
            DashboardDto.FittingDto.builder()
                .id(f.getId())
                .fittingDate(f.getFittingDate() != null ? f.getFittingDate().toString() : null)
                .status(f.getStatus().name())
                .staffName(f.getStaff() != null ? f.getStaff().getFullName() : null)
                .tailoringOrderId(f.getTailoringOrder() != null ? f.getTailoringOrder().getId() : null)
                .build()
        ).collect(Collectors.toList());

        // Active tailoring orders (not DONE)
        long activeTailoring = tailoringOrderRepository.countByStatusNot(TailoringOrder.Status.DONE);

        // Revenue chart — last 7 days by default
        List<DashboardDto.DailyRevenueDto> chart = buildRevenueChart(7);

        DashboardDto stats = DashboardDto.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .statusCounts(statusCounts)
                .recentOrders(recentOrders)
                .todayOrders(todayOrders)
                .todayRevenue(todayRev)
                .pendingOrders(pendingOrders)
                .upcomingFittings(upcomingFit)
                .upcomingFittingsList(fitDtos)
                .activeTailoringOrders(activeTailoring)
                .revenueChart(chart)
                .build();

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/revenue-chart")
    @Operation(summary = "Get daily revenue chart data",
               description = "Supports period=7|14|30 (days) or custom from/to dates.")
    public ResponseEntity<ApiResponse<List<DashboardDto.DailyRevenueDto>>> getRevenueChart(
            @RequestParam(defaultValue = "7") int period) {

        if (period < 1 || period > 365) period = 7;
        List<DashboardDto.DailyRevenueDto> chart = buildRevenueChart(period);
        return ResponseEntity.ok(ApiResponse.ok(chart));
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private List<DashboardDto.DailyRevenueDto> buildRevenueChart(int days) {
        ZonedDateTime end   = LocalDate.now(VN_ZONE).plusDays(1).atStartOfDay(VN_ZONE);
        ZonedDateTime start = end.minusDays(days);
        Instant from = start.toInstant();
        Instant to   = end.toInstant();

        List<Object[]> rows = orderRepository.findDailyRevenue(from, to);

        // Build a date-keyed map from DB results
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        Map<String, DashboardDto.DailyRevenueDto> map = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String date       = row[0].toString();          // DATE as string "2025-05-19"
            BigDecimal rev    = new BigDecimal(row[1].toString());
            long orderCount   = ((Number) row[2]).longValue();
            map.put(date, DashboardDto.DailyRevenueDto.builder()
                    .date(date).revenue(rev).orderCount(orderCount).build());
        }

        // Fill in missing days with 0
        List<DashboardDto.DailyRevenueDto> result = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            String dateStr = start.plusDays(i).toLocalDate().format(fmt);
            result.add(map.getOrDefault(dateStr,
                    DashboardDto.DailyRevenueDto.builder()
                            .date(dateStr).revenue(BigDecimal.ZERO).orderCount(0L).build()));
        }
        return result;
    }
}
