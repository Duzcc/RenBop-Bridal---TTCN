import React, { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { Trophy, Medal, Star, Crown, TrendingUp, Flame } from 'lucide-react';

const LEVEL_CONFIG = {
    DIAMOND: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: Crown, next: null, threshold: 6000 },
    PLATINUM: { color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/30', icon: Trophy, next: 'DIAMOND', threshold: 3000 },
    GOLD:     { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: Medal, next: 'PLATINUM', threshold: 1500 },
    SILVER:   { color: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-500/30', icon: Medal, next: 'GOLD', threshold: 500 },
    BRONZE:   { color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30', icon: Star, next: 'SILVER', threshold: 0 },
};

const LEVEL_THRESHOLDS = { BRONZE: 0, SILVER: 500, GOLD: 1500, PLATINUM: 3000, DIAMOND: 6000 };

const GamificationWidget = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchMyStats = async () => {
            try {
                const res = await apiClient('/admin/gamification/me');
                if (res.success) {
                    setStats(res.data);
                }
            } catch (err) {
                console.error('Gamification fetch error', err);
            }
        };
        fetchMyStats();
    }, []);

    if (!stats) return null;

    const config = LEVEL_CONFIG[stats.level] || LEVEL_CONFIG.BRONZE;
    const Icon = config.icon;

    // Calculate progress bar
    const currentThreshold = LEVEL_THRESHOLDS[stats.level] || 0;
    const nextThreshold = config.next ? LEVEL_THRESHOLDS[config.next] : currentThreshold + 1;
    const progress = config.next
        ? Math.min(100, Math.round(((stats.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
        : 100;

    return (
        <div className="mx-4 mt-2 mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#1a1b2e] to-[#0d0e17] border border-white/5 relative overflow-hidden group">
            {/* Glossy effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-3 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color} border ${config.border} shadow-lg flex-shrink-0`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-black uppercase tracking-widest text-[#9999b0] mb-0.5">Cấp độ của bạn</div>
                    <div className={`text-[14px] font-black tracking-wide ${config.color}`}>{stats.level}</div>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="text-[9px] text-white/40 font-bold mb-0.5">Tuần này</div>
                    <div className="flex items-center gap-1 text-orange-400">
                        <Flame size={11} />
                        <span className="text-[12px] font-black">{stats.weeklyPoints || 0}</span>
                    </div>
                </div>
            </div>

            {/* Progress bar to next level */}
            {config.next && (
                <div className="mt-3 relative z-10">
                    <div className="flex justify-between text-[9px] font-bold text-white/30 mb-1">
                        <span>{stats.points} điểm</span>
                        <span>→ {config.next} ({nextThreshold})</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${config.color.replace('text-', 'bg-')}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {stats.level === 'DIAMOND' && (
                <div className="mt-3 text-center text-[9px] font-black text-cyan-400/70 tracking-widest uppercase relative z-10">
                    ✦ Đỉnh cao ✦
                </div>
            )}
        </div>
    );
};

export default GamificationWidget;
