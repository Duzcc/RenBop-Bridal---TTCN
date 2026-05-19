import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../../utils/apiClient';
import {
    Users, Package, ShoppingBag, DollarSign,
    ArrowUpRight, TrendingUp, ChevronRight, Calendar,
    AlertCircle, Clock, CheckCircle2, BellRing, ArrowRight,
    ClipboardList
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

/* ── Mock data ── */
const STATUS_COLORS = {
    PENDING:     '#f59e0b',
    IN_PROGRESS: '#3b82f6',
    COMPLETED:   '#10b981',
    CANCELLED:   '#ef4444',
};
const STATUS_LABEL = {
    PENDING:     'Chờ xử lý',
    IN_PROGRESS: 'Đang xử lý',
    COMPLETED:   'Hoàn thành',
    CANCELLED:   'Đã hủy',
};

/* ── Custom Tooltips ── */
const AreaTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0d0e17] text-white px-4 py-3 rounded-xl shadow-2xl text-[12px] font-bold min-w-[140px] border border-white/10">
            <p className="text-[#c9a96e] mb-2 uppercase tracking-wider text-[10px]">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex justify-between gap-4">
                    <span className="text-white/60">{p.name}</span>
                    <span style={{ color: p.color }}>{p.value?.toLocaleString('vi-VN')}</span>
                </div>
            ))}
        </div>
    );
};

const DonutTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
        <div className="bg-[#0d0e17] text-white px-3 py-2 rounded-xl shadow-2xl text-[12px] font-bold border border-white/10">
            <span className="text-white/60 mr-2">{STATUS_LABEL[d.name] || d.name}:</span>
            <span style={{ color: d.payload.fill }}>{d.value} đơn</span>
        </div>
    );
};

/* ── Skeleton Loader ── */
const SkeletonDashboard = () => (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6 font-sans animate-pulse">
        <div className="h-10 w-64 bg-[#e8e8f0] rounded-xl mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="h-64 bg-[#e8e8f0] rounded-3xl" />
            <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[#f4f4f8] rounded-3xl" />)}
            </div>
            <div className="h-64 bg-[#e8e8f0] rounded-3xl" />
        </div>
        <div className="h-[400px] bg-[#f4f4f8] rounded-3xl" />
    </div>
);

/* ── Main Component ── */
const AdminOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const revenueData = useMemo(() => {
        if (!stats?.revenueChart) return [];
        return stats.revenueChart.map(item => {
            const [, month, day] = item.date.split('-');
            return {
                name: `${day}/${month}`,
                doanhThu: item.revenue || 0,
                donHang: item.orderCount || 0
            };
        });
    }, [stats]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiClient('/admin/dashboard');
                if (res.success) setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch dashboard stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    const formatAxisCurrency = (val) => {
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}tr`;
        return val.toLocaleString('vi-VN');
    };

    const donutData = useMemo(() => {
        if (!stats?.statusCounts) return [];
        return Object.entries(stats.statusCounts).map(([key, value]) => ({ name: key, value }));
    }, [stats]);

    const cards = [
        { label: 'Doanh thu hôm nay', value: formatCurrency(stats?.todayRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Mới', stroke: '#059669' },
        { label: 'Đơn hàng hôm nay', value: stats?.todayOrders ?? '0', icon: ShoppingBag, color: 'text-[#c9a96e]', bg: 'bg-[#c9a96e]/10', trend: 'Mới', stroke: '#c9a96e' },
        { label: 'Khách hàng', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+4.2%', stroke: '#2563eb' },
        { label: 'Tổng doanh thu', value: formatCurrency(stats?.totalRevenue), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Tất cả', stroke: '#9333ea' },
    ];

    if (loading) return <SkeletonDashboard />;

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6 font-sans">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-black text-[#0d0e17] tracking-tight">Tổng quan Hệ thống</h1>
                    <p className="text-[14px] font-medium text-[#6b6b80] mt-1 flex items-center gap-2">
                        <Calendar size={14} />
                        Hôm nay, {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-[#f8f8fc] border border-[#e8e8f0] rounded-2xl">
                    <button className="px-4 py-2 text-[13px] font-bold bg-white text-[#0d0e17] shadow-sm rounded-xl transition-all">7 ngày qua</button>
                    <button className="px-4 py-2 text-[13px] font-bold text-[#9999b0] hover:text-[#0d0e17] rounded-xl transition-all">30 ngày qua</button>
                </div>
            </div>

            {/* Bento Grid Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* 1. Actionable Alerts (Span 1) */}
                <div className="bg-[#0d0e17] rounded-3xl p-6 shadow-lg text-white flex flex-col justify-between relative overflow-hidden group h-[380px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a96e] rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <BellRing size={20} className="text-[#c9a96e]" />
                            <h3 className="font-black text-[15px] tracking-wide">Cần Xử Lý Ngay</h3>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                                    <AlertCircle size={16} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-white">{stats?.pendingOrders || 0} Đơn hàng mới</p>
                                    <p className="text-[11px] text-white/60 font-medium">Đang chờ xử lý</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                    <ClipboardList size={16} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-white">{stats?.activeTailoringOrders || 0} Phiếu may đo</p>
                                    <p className="text-[11px] text-white/60 font-medium">Đang trong tiến trình sản xuất</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[12px] font-bold transition-colors flex items-center justify-center gap-2">
                        Xem chi tiết <ArrowRight size={14} />
                    </button>
                </div>

                {/* 2. KPI Metrics (Span 2) */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4 h-[380px]">
                    {cards.map((card, idx) => (
                        <div key={idx} className="bg-white rounded-3xl border border-[#e8e8f0] p-5 shadow-sm hover:shadow-xl hover:border-[#c9a96e] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                            {/* Subtle glowing radial background */}
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                                 style={{ backgroundColor: card.stroke }} />
                            
                            <div className="flex items-start justify-between relative z-10">
                                <div className={`${card.bg} ${card.color} p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                                    <card.icon size={18} />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 shadow-sm">
                                    <ArrowUpRight size={12} /> {card.trend}
                                </div>
                            </div>
                            
                            <div className="mt-4 relative z-10">
                                <p className="text-[#9999b0] text-[9px] font-black uppercase tracking-widest mb-1">{card.label}</p>
                                <p className="text-2xl font-black text-[#0d0e17] tracking-tight group-hover:text-[#c9a96e] transition-colors">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. Fitting Sessions Timeline (Span 1) */}
                <div className="bg-white rounded-3xl border border-[#e8e8f0] shadow-sm p-6 flex flex-col h-[380px]">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-black text-[15px] text-[#0d0e17]">Lịch Hẹn Sắp Tới</h3>
                        <span className="bg-[#c9a96e]/10 text-[#c9a96e] px-2 py-1 rounded-md text-[11px] font-bold">{stats?.upcomingFittings?.length || 0} Lịch</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4 relative">
                        <div className="absolute left-2 top-2 bottom-2 w-px bg-[#f4f4f8]" />
                        {(stats?.upcomingFittingsList || []).map((fit, i) => (
                            <div key={fit.id} className="relative pl-6">
                                <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-white ${
                                    fit.status === 'COMPLETED' ? 'bg-emerald-500' :
                                    fit.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-[#e8e8f0]'
                                }`} />
                                <div className="text-[11px] font-bold text-[#c9a96e] mb-0.5">{fit.fittingDate ? new Date(fit.fittingDate).toLocaleString('vi-VN', {hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'}) : '—'}</div>
                                <div className="text-[13px] font-bold text-[#0d0e17]">Phụ trách: {fit.staffName || 'Chưa gán'}</div>
                                <div className="text-[11px] font-medium text-[#9999b0]">Đơn may đo #{fit.tailoringOrderId}</div>
                            </div>
                        ))}
                        {(!stats?.upcomingFittingsList || stats.upcomingFittingsList.length === 0) && (
                            <div className="text-[12px] text-[#9999b0] font-medium mt-4">Không có lịch hẹn.</div>
                        )}
                    </div>
                    <button className="mt-4 text-[12px] font-bold text-[#6b6b80] hover:text-[#0d0e17] text-center transition-colors">
                        Xem toàn bộ lịch hẹn
                    </button>
                </div>
            </div>

            {/* Bento Grid Middle Row: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Area Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-[#e8e8f0] shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-[15px] font-black text-[#0d0e17]">Doanh thu & Đơn hàng</h3>
                            <p className="text-[12px] text-[#9999b0] font-medium mt-0.5">7 ngày gần nhất</p>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-bold">
                            <span className="flex items-center gap-1.5 text-[#6b6b80]">
                                <span className="w-3 h-3 rounded-full bg-[#c9a96e]" /> Doanh thu
                            </span>
                            <span className="flex items-center gap-1.5 text-[#6b6b80]">
                                <span className="w-3 h-3 rounded-full bg-blue-400" /> Đơn hàng
                            </span>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#c9a96e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#9999b0' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" tickFormatter={formatAxisCurrency} tick={{ fontSize: 10, fontWeight: 700, fill: '#9999b0' }} axisLine={false} tickLine={false} width={48} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fontWeight: 700, fill: '#9999b0' }} axisLine={false} tickLine={false} width={30} />
                                <Tooltip content={<AreaTooltip />} cursor={{ stroke: '#e8e8f0', strokeWidth: 1 }} />
                                <Area yAxisId="left" type="monotone" dataKey="doanhThu" stroke="#c9a96e" strokeWidth={2.5} fill="url(#gradGold)" dot={false} activeDot={{ r: 5, fill: '#c9a96e', stroke: 'white', strokeWidth: 2 }} />
                                <Area yAxisId="right" type="monotone" dataKey="donHang" stroke="#60a5fa" strokeWidth={2.5} fill="url(#gradBlue)" dot={false} activeDot={{ r: 5, fill: '#60a5fa', stroke: 'white', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-white rounded-3xl border border-[#e8e8f0] shadow-sm p-6 flex flex-col">
                    <div className="mb-2">
                        <h3 className="text-[15px] font-black text-[#0d0e17]">Phân bổ Đơn hàng</h3>
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={donutData.length ? donutData : [
                                        { name: 'COMPLETED', value: 45 }, { name: 'PENDING', value: 20 },
                                        { name: 'IN_PROGRESS', value: 25 }, { name: 'CANCELLED', value: 10 }
                                    ]}
                                    cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" paddingAngle={3} dataKey="value" strokeWidth={0}
                                >
                                    {(donutData.length ? donutData : [
                                        { name: 'COMPLETED', value: 45 }, { name: 'PENDING', value: 20 },
                                        { name: 'IN_PROGRESS', value: 25 }, { name: 'CANCELLED', value: 10 }
                                    ]).map((entry, index) => (
                                        <Cell key={index} fill={STATUS_COLORS[entry.name] || '#9999b0'} />
                                    ))}
                                </Pie>
                                <Tooltip content={<DonutTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2.5">
                        {(donutData.length ? donutData : [
                            { name: 'COMPLETED', value: 45 }, { name: 'PENDING', value: 20 },
                            { name: 'IN_PROGRESS', value: 25 }, { name: 'CANCELLED', value: 10 }
                        ]).map((d, i) => {
                            const total = donutData.length ? stats?.totalOrders || 1 : 100;
                            const pct = Math.round((d.value / total) * 100);
                            return (
                                <div key={i} className="flex items-center justify-between text-[12px]">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[d.name] || '#9999b0' }} />
                                        <span className="font-bold text-[#6b6b80]">{STATUS_LABEL[d.name] || d.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-[#0d0e17]">{d.value}</span>
                                        <span className="text-[10px] font-bold text-[#9999b0] w-8 text-right">{pct}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Funnel Chart (Ultra Luxury Wedding Silhouette Funnel) */}
                <div className="bg-gradient-to-br from-[#0d0e17] to-[#1a1b2e] rounded-3xl p-6 shadow-xl text-white flex flex-col justify-between border border-white/5 relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#c9a96e] rounded-full blur-[90px] opacity-10" />
                    <div className="mb-4 relative z-10">
                        <h3 className="text-[14px] font-black uppercase tracking-widest text-[#c9a96e]">Phễu Chuyển Đổi</h3>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">Hiệu suất kinh doanh & chốt hợp đồng</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-2 relative z-10">
                        {[
                            { name: 'Khách Ghé Cửa Hàng', value: 1250, bg: 'from-blue-600/20 to-blue-500/10 border-blue-500/30 text-blue-400', w: 'w-full' },
                            { name: 'Inbox / Tư Vấn Online', value: 450, bg: 'from-violet-600/20 to-violet-500/10 border-violet-500/30 text-violet-400', w: 'w-[88%]' },
                            { name: 'Đặt Lịch Thử Váy', value: 180, bg: 'from-amber-600/20 to-amber-500/10 border-amber-500/30 text-amber-400', w: 'w-[76%]' },
                            { name: 'Đã Chốt Hợp Đồng', value: 65, bg: 'from-emerald-600/20 to-emerald-500/10 border-emerald-500/30 text-emerald-400', w: 'w-[64%]' }
                        ].map((step, i, arr) => (
                            <div key={i} className="flex flex-col items-center w-full">
                                <div className={`h-11 ${step.w} flex items-center justify-between px-4 rounded-2xl border bg-gradient-to-r ${step.bg} shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}>
                                    <span className="text-[11px] font-bold tracking-wide">{step.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-black">{step.value}</span>
                                        <span className="text-[9px] font-mono opacity-50">leads</span>
                                    </div>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="h-5 flex items-center justify-center text-[10px] font-black text-[#c9a96e] animate-pulse">
                                        ✦ Tỷ lệ giữ chân: {Math.round((arr[i+1].value / step.value) * 100)}%
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Orders Table */}
            <div className="bg-white rounded-3xl border border-[#e8e8f0] shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-[#f4f4f8] flex items-center justify-between">
                    <div>
                        <h3 className="text-[15px] font-black text-[#0d0e17]">Đơn hàng mới nhất</h3>
                        <p className="text-[12px] text-[#9999b0] font-medium mt-0.5">{stats?.recentOrders?.length || 0} đơn gần nhất</p>
                    </div>
                    <button className="text-[13px] font-bold text-[#c9a96e] flex items-center gap-1 hover:gap-2 transition-all">
                        Xem tất cả <ChevronRight size={16} />
                    </button>
                </div>
                <div className="overflow-x-auto admin-scroll">
                    <table className="w-full text-left text-[13px]">
                        <thead className="bg-[#f8f8fc] text-[10px] font-black uppercase tracking-wider text-[#9999b0] border-b border-[#e8e8f0]">
                            <tr>
                                <th className="px-8 py-4">ID / Khách hàng</th>
                                <th className="px-8 py-4">Số tiền</th>
                                <th className="px-8 py-4">Trạng thái</th>
                                <th className="px-8 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f4f4f8]">
                            {stats?.recentOrders?.length > 0 ? stats.recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-[#f8f8fc] transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a96e] to-[#e2c08a] flex items-center justify-center text-white text-[11px] font-black uppercase shrink-0">
                                                {(order.customerName || '#')[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#0d0e17]">#{order.id}</div>
                                                <div className="text-[11px] text-[#9999b0]">{order.customerName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 font-black text-[#0d0e17]">
                                        {formatCurrency(order.totalAmount)}
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold ${
                                            order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            order.status === 'PENDING'   ? 'bg-amber-50   text-amber-700   border-amber-200'   :
                                            order.status === 'CANCELLED' ? 'bg-red-50     text-red-700     border-red-200'     :
                                                                           'bg-blue-50    text-blue-700    border-blue-200'
                                        }`}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[order.status] || '#6b6b80' }} />
                                            {STATUS_LABEL[order.status] || order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="p-2 bg-[#f8f8fc] rounded-xl text-[#9999b0] opacity-0 group-hover:opacity-100 group-hover:text-[#c9a96e] group-hover:bg-[#c9a96e]/10 transition-all">
                                            <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-[#9999b0] font-medium text-[13px]">
                                        Chưa có dữ liệu đơn hàng.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default AdminOverview;
