package com.renbobridal.module.gamification.service;

import com.renbobridal.module.auth.entity.User;
import com.renbobridal.module.auth.repository.UserRepository;
import com.renbobridal.module.gamification.entity.PointTransaction;
import com.renbobridal.module.gamification.entity.StaffPoint;
import com.renbobridal.module.gamification.repository.PointTransactionRepository;
import com.renbobridal.module.gamification.repository.StaffPointRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.time.DayOfWeek;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {

    private final StaffPointRepository staffPointRepository;
    private final PointTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Transactional
    public void awardPoints(Long userId, String action, Integer points, String description) {
        if (userId == null || points <= 0) return;

        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getRole() == User.Role.CUSTOMER) return; // Only staff/admin

        StaffPoint sp = staffPointRepository.findByUserId(userId)
                .orElse(StaffPoint.builder()
                        .userId(userId)
                        .totalPoints(0)
                        .weeklyPoints(0)
                        .monthlyPoints(0)
                        .level("BRONZE")
                        .build());

        checkAndResetPeriods(sp);

        sp.setTotalPoints(sp.getTotalPoints() + points);
        sp.setWeeklyPoints(sp.getWeeklyPoints() + points);
        sp.setMonthlyPoints(sp.getMonthlyPoints() + points);
        sp.setLevel(calculateLevel(sp.getTotalPoints()));

        staffPointRepository.save(sp);

        PointTransaction tx = PointTransaction.builder()
                .userId(userId)
                .action(action)
                .points(points)
                .description(description)
                .build();
        transactionRepository.save(tx);

        log.info("Awarded {} points to user {} for {}", points, userId, action);
    }

    private void checkAndResetPeriods(StaffPoint sp) {
        LocalDate today = LocalDate.now(VN_ZONE);
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate startOfMonth = today.withDayOfMonth(1);

        if (sp.getWeekStart() == null || !sp.getWeekStart().equals(startOfWeek)) {
            sp.setWeeklyPoints(0);
            sp.setWeekStart(startOfWeek);
        }

        if (sp.getMonthStart() == null || !sp.getMonthStart().equals(startOfMonth)) {
            sp.setMonthlyPoints(0);
            sp.setMonthStart(startOfMonth);
        }
    }

    private String calculateLevel(int totalPoints) {
        if (totalPoints >= 6000) return "DIAMOND";
        if (totalPoints >= 3000) return "PLATINUM";
        if (totalPoints >= 1500) return "GOLD";
        if (totalPoints >= 500) return "SILVER";
        return "BRONZE";
    }

    @Transactional(readOnly = true)
    public List<StaffPoint> getWeeklyLeaderboard(int limit) {
        return staffPointRepository.findTopByWeeklyPointsDesc(PageRequest.of(0, limit));
    }

    @Transactional(readOnly = true)
    public List<StaffPoint> getTotalLeaderboard(int limit) {
        return staffPointRepository.findTopByTotalPointsDesc(PageRequest.of(0, limit));
    }
}
