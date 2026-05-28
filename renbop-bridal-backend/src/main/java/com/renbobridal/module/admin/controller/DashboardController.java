package com.renbobridal.module.admin.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.admin.dto.DashboardDto;
import com.renbobridal.module.admin.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Endpoints for admin statistics and reports")
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;
    private final CacheManager cacheManager;

    @GetMapping
    @Operation(summary = "Get overall dashboard statistics (Cached or Real-time if filtered)")
    public ResponseEntity<ApiResponse<DashboardDto>> getDashboardStats(
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        
        boolean isCached = false;
        long start = System.currentTimeMillis();
        DashboardDto stats = dashboardService.getDashboardStats(from, to);
        long executionTime = System.currentTimeMillis() - start;

        stats.setCacheHit(isCached);
        stats.setExecutionTimeMs(executionTime);

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/revenue-chart")
    @Operation(summary = "Get daily revenue chart data",
               description = "Supports period=7|14|30|365 or from/to dates.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenueChart(
            @RequestParam(defaultValue = "7") int period,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {

        boolean isCached = false;
        long start = System.currentTimeMillis();
        
        List<DashboardDto.DailyRevenueDto> chart;
        if (from != null && to != null) {
            chart = dashboardService.getCustomRevenueChart(from, to);
        } else {
            if (period < 1 || period > 365) period = 7;
            chart = dashboardService.getRevenueChart(period);
        }
        
        long executionTime = System.currentTimeMillis() - start;
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("chartData", chart);
        responseData.put("cacheHit", isCached);
        responseData.put("executionTimeMs", executionTime);

        return ResponseEntity.ok(ApiResponse.ok(responseData));
    }
    
    @PostMapping("/clear-cache")
    @Operation(summary = "Clear dashboard cache manually")
    public ResponseEntity<ApiResponse<Void>> clearCache() {
        cacheManager.getCache("dashboard").clear();
        cacheManager.getCache("dashboard_yearly").clear();
        return ResponseEntity.ok(ApiResponse.ok("Cache cleared"));
    }
}
