package com.renbobridal.module.admin.service;

import com.renbobridal.module.admin.dto.DashboardDto;
import com.renbobridal.module.auth.repository.UserRepository;
import com.renbobridal.module.order.entity.FittingSession;
import com.renbobridal.module.order.entity.Order;
import com.renbobridal.module.order.entity.TailoringOrder;
import com.renbobridal.module.order.repository.FittingSessionRepository;
import com.renbobridal.module.order.repository.OrderRepository;
import com.renbobridal.module.order.repository.TailoringOrderRepository;
import com.renbobridal.module.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final FittingSessionRepository fittingSessionRepository;
    private final TailoringOrderRepository tailoringOrderRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardStats", key = "(#from != null ? #from.toString() : 'null') + '-' + (#to != null ? #to.toString() : 'null')")
    public DashboardDto getDashboardStats(Instant from, Instant to) {
        log.info("Calculating dashboard stats from DB (from={}, to={})...", from, to);
        long totalUsers    = userRepository.countUsers(from, to);
        long totalProducts = productRepository.countProducts(from, to);
        long totalOrders   = orderRepository.countTotalOrders(from, to);
        BigDecimal totalRevenue = Optional.ofNullable(orderRepository.calculateTotalRevenue(from, to))
                .orElse(BigDecimal.ZERO);

        // Status counts
        List<Object[]> counts = orderRepository.countOrdersByStatus(from, to);
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

        return DashboardDto.builder()
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
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard_yearly", key = "'revenue_' + #days")
    public List<DashboardDto.DailyRevenueDto> getRevenueChart(int days) {
        log.info("Calculating revenue chart for {} days from DB...", days);
        return buildRevenueChart(days);
    }

    private List<DashboardDto.DailyRevenueDto> buildRevenueChart(int days) {
        ZonedDateTime end   = LocalDate.now(VN_ZONE).plusDays(1).atStartOfDay(VN_ZONE);
        ZonedDateTime start = end.minusDays(days);
        Instant from = start.toInstant();
        Instant to   = end.toInstant();

        return generateRevenueChart(from, to, days);
    }

    public List<DashboardDto.DailyRevenueDto> getCustomRevenueChart(Instant from, Instant to) {
        // Calculate days between from and to for filling missing days
        long daysBetween = java.time.Duration.between(from, to).toDays();
        if (daysBetween <= 0) daysBetween = 1;
        return generateRevenueChart(from, to, (int) daysBetween);
    }

    private List<DashboardDto.DailyRevenueDto> generateRevenueChart(Instant from, Instant to, int days) {

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
        ZonedDateTime startZdt = from.atZone(VN_ZONE);
        List<DashboardDto.DailyRevenueDto> result = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            String dateStr = startZdt.plusDays(i).toLocalDate().format(fmt);
            result.add(map.getOrDefault(dateStr,
                    DashboardDto.DailyRevenueDto.builder()
                            .date(dateStr).revenue(BigDecimal.ZERO).orderCount(0L).build()));
        }
        return result;
    }
}
