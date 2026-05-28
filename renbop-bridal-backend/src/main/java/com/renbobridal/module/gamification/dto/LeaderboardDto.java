package com.renbobridal.module.gamification.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class LeaderboardDto {
    private List<RankEntry> weekly;
    private List<RankEntry> allTime;

    @Data
    @Builder
    public static class RankEntry {
        private Long userId;
        private String fullName;
        private Integer points;
        private String level;
    }
}
