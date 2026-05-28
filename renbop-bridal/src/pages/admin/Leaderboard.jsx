import React, { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { Trophy, Medal, Star, Crown, ChevronRight, Award } from 'lucide-react';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState({ weekly: [], allTime: [] });
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('weekly');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await apiClient('/admin/gamification/leaderboard');
                if (res.success) {
                    setLeaderboard(res.data);
                }
            } catch (error) {
                console.error('Error fetching leaderboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="text-yellow-400" size={24} />;
        if (index === 1) return <Medal className="text-slate-300" size={24} />;
        if (index === 2) return <Medal className="text-amber-600" size={24} />;
        return <span className="text-lg font-black text-[#9999b0] w-6 text-center">{index + 1}</span>;
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'DIAMOND': return 'text-cyan-500 bg-cyan-50';
            case 'PLATINUM': return 'text-slate-600 bg-slate-100';
            case 'GOLD': return 'text-yellow-600 bg-yellow-50';
            case 'SILVER': return 'text-gray-500 bg-gray-100';
            default: return 'text-amber-700 bg-amber-50';
        }
    };

    const activeList = tab === 'weekly' ? leaderboard.weekly : leaderboard.allTime;

    return (
        <div className="max-w-[1000px] mx-auto px-6 py-8 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-[#0d0e17] tracking-tight mb-2">Bảng Xếp Hạng Nhân Viên</h1>
                <p className="text-[#6b6b80] font-medium">Thi đua thành tích và hoàn thành nhiệm vụ để tích lũy điểm thưởng.</p>
            </div>

            <div className="flex bg-[#f8f8fc] p-1.5 rounded-2xl border border-[#e8e8f0] w-fit mb-8 shadow-sm">
                <button 
                    onClick={() => setTab('weekly')}
                    className={`px-8 py-3 rounded-xl font-bold text-[14px] transition-all ${tab === 'weekly' ? 'bg-white text-[#0d0e17] shadow-sm' : 'text-[#6b6b80] hover:text-[#0d0e17]'}`}
                >
                    Top Tuần Này
                </button>
                <button 
                    onClick={() => setTab('allTime')}
                    className={`px-8 py-3 rounded-xl font-bold text-[14px] transition-all ${tab === 'allTime' ? 'bg-white text-[#0d0e17] shadow-sm' : 'text-[#6b6b80] hover:text-[#0d0e17]'}`}
                >
                    Tất Cả Thời Gian
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#e8e8f0] shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#c9a96e] border-t-transparent" />
                    </div>
                ) : activeList.length === 0 ? (
                    <div className="text-center py-20 text-[#9999b0] font-medium text-[14px]">
                        Chưa có dữ liệu xếp hạng.
                    </div>
                ) : (
                    <div className="divide-y divide-[#f4f4f8]">
                        {activeList.map((entry, index) => (
                            <div key={entry.userId} className="flex items-center justify-between p-6 hover:bg-[#f8f8fc] transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className="w-8 flex justify-center">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0d0e17] to-[#1a1b2e] flex items-center justify-center text-white font-black text-lg shadow-md border border-white/10 uppercase">
                                        {entry.fullName[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-[16px] text-[#0d0e17] group-hover:text-[#c9a96e] transition-colors">
                                            {entry.fullName}
                                        </div>
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded-md text-[10px] font-black tracking-widest ${getLevelColor(entry.level)}`}>
                                            {entry.level}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="font-black text-2xl text-[#0d0e17] tracking-tighter">
                                            {entry.points.toLocaleString('vi-VN')}
                                        </div>
                                        <div className="text-[11px] font-bold text-[#9999b0] uppercase tracking-widest">Points</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
