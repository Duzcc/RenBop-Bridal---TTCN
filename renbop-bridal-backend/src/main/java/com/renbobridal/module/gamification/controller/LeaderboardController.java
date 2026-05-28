package com.renbobridal.module.gamification.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.auth.entity.User;
import com.renbobridal.module.auth.repository.UserRepository;
import com.renbobridal.module.gamification.dto.LeaderboardDto;
import com.renbobridal.module.gamification.entity.StaffPoint;
import com.renbobridal.module.gamification.service.GamificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/gamification")
@RequiredArgsConstructor
@Tag(name = "Admin Gamification", description = "Endpoints for staff leaderboard and points")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class LeaderboardController {

    private final GamificationService gamificationService;
    private final UserRepository userRepository;

    @GetMapping("/leaderboard")
    @Operation(summary = "Get top 10 staff leaderboard (weekly and all-time)")
    public ResponseEntity<ApiResponse<LeaderboardDto>> getLeaderboard() {
        List<StaffPoint> weeklyPoints = gamificationService.getWeeklyLeaderboard(10);
        List<StaffPoint> allTimePoints = gamificationService.getTotalLeaderboard(10);

        List<Long> userIds = weeklyPoints.stream().map(StaffPoint::getUserId).collect(Collectors.toList());
        userIds.addAll(allTimePoints.stream().map(StaffPoint::getUserId).collect(Collectors.toList()));

        Map<Long, String> userNames = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName));

        List<LeaderboardDto.RankEntry> weekly = weeklyPoints.stream()
                .map(sp -> LeaderboardDto.RankEntry.builder()
                        .userId(sp.getUserId())
                        .fullName(userNames.getOrDefault(sp.getUserId(), "Unknown"))
                        .points(sp.getWeeklyPoints())
                        .level(sp.getLevel())
                        .build())
                .collect(Collectors.toList());

        List<LeaderboardDto.RankEntry> allTime = allTimePoints.stream()
                .map(sp -> LeaderboardDto.RankEntry.builder()
                        .userId(sp.getUserId())
                        .fullName(userNames.getOrDefault(sp.getUserId(), "Unknown"))
                        .points(sp.getTotalPoints())
                        .level(sp.getLevel())
                        .build())
                .collect(Collectors.toList());

        LeaderboardDto dto = LeaderboardDto.builder()
                .weekly(weekly)
                .allTime(allTime)
                .build();

        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/me")
    @Operation(summary = "Get points and level for current user")
    public ResponseEntity<ApiResponse<LeaderboardDto.RankEntry>> getMyStats(
            @AuthenticationPrincipal Long userId
    ) {
        // Will be 0 if no record yet
        List<StaffPoint> all = gamificationService.getTotalLeaderboard(1000);
        StaffPoint mySp = all.stream().filter(sp -> sp.getUserId().equals(userId)).findFirst().orElse(null);

        if (mySp == null) {
            User u = userRepository.findById(userId).orElseThrow();
            return ResponseEntity.ok(ApiResponse.ok(LeaderboardDto.RankEntry.builder()
                    .userId(userId).fullName(u.getFullName()).points(0).level("BRONZE").build()));
        }

        User u = userRepository.findById(userId).orElseThrow();
        LeaderboardDto.RankEntry entry = LeaderboardDto.RankEntry.builder()
                .userId(userId)
                .fullName(u.getFullName())
                .points(mySp.getTotalPoints())
                .level(mySp.getLevel())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(entry));
    }
}
