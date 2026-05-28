import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, ShoppingBag, PackageSearch, Users,
    LogOut, ArrowLeft, Calendar, Scissors, RotateCcw,
    ChevronDown, ChevronRight, Menu, X,
    Store, Sparkles, Layers, CreditCard, Search, History, Trophy
} from 'lucide-react';
import CommandPalette from '../common/CommandPalette';
import NotificationCenter from '../common/NotificationCenter';
import GamificationWidget from '../admin/GamificationWidget';

const NAV_GROUPS = [
    {
        group: 'TỔNG QUAN',
        items: [
            { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Thống kê' },
        ]
    },
    {
        label: 'CỬA HÀNG',
        items: [
            { path: '/admin/orders',   icon: ShoppingBag,   label: 'Đơn hàng' },
            { path: '/admin/payments', icon: CreditCard,    label: 'Giao dịch' },
            { path: '/admin/products', icon: PackageSearch, label: 'Sản phẩm' },
            { path: '/admin/categories', icon: Layers,      label: 'Danh mục' },
            { path: '/admin/users',    icon: Users,         label: 'Khách hàng' },
        ]
    },
    {
        label: 'QUY TRÌNH',
        items: [
            { path: '/admin/tailoring-orders',  icon: Scissors,  label: 'Phiếu May Đo' },
            { path: '/admin/fitting-sessions',  icon: Calendar,  label: 'Lịch Thử Đồ' },
            { path: '/admin/returns',           icon: RotateCcw, label: 'Quản lý Trả' },
        ]
    },
    {
        label: 'HỆ THỐNG',
        items: [
            { path: '/admin/leaderboard',       icon: Trophy,    label: 'Bảng xếp hạng' },
            { path: '/admin/activity-log',      icon: History,   label: 'Nhật ký HĐ' },
        ]
    }
];

export default function AdminLayout({ children }) {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setPaletteOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        }
    }, []);

    const isActive = (path) => location.pathname.startsWith(path);

    const SidebarNav = ({ onClose }) => (
        <div className="flex flex-col h-full admin-scroll overflow-y-auto" style={{ background: 'var(--admin-sidebar-bg)' }}>
            {/* ── Brand ── */}
            <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid var(--admin-sidebar-border)' }}>
                <div className="relative w-8 h-8 flex-shrink-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #c9a96e 0%, #e2c08a 50%, #c9a96e 100%)' }}>
                        <Store size={15} className="text-white" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
                        style={{ borderColor: 'var(--admin-sidebar-bg)' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold tracking-[0.15em] admin-gold-shimmer leading-none select-none">
                        RENBO BRIDAL
                    </p>
                    <p className="text-[9px] mt-0.5 leading-none" style={{ color: 'rgba(255,255,255,0.28)' }}>
                        Admin Console
                    </p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1 rounded-lg transition hover:bg-white/8"
                        style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 py-3 px-2.5 space-y-0.5">
                {NAV_GROUPS.map((group, gi) => (
                    <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
                        {group.label && (
                            <p className="px-3 py-1.5 text-[9px] font-bold tracking-[0.22em] uppercase select-none"
                                style={{ color: 'rgba(255,255,255,0.2)' }}>
                                {group.label}
                            </p>
                        )}
                        {group.items.map(({ path, icon: Icon, label }) => {
                            const active = isActive(path);
                            return (
                                <Link key={path} to={path} onClick={onClose}
                                    className="group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 mb-0.5"
                                    style={{
                                        background: active ? 'rgba(201, 169, 110, 0.12)' : 'transparent',
                                        color: active ? '#e2c08a' : 'rgba(255,255,255,0.45)',
                                        fontWeight: active ? '600' : '400',
                                    }}
                                    onMouseEnter={e => {
                                        if (!active) {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                            e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!active) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                                        }
                                    }}
                                >
                                    {/* Active indicator */}
                                    {active && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                                            style={{ background: 'linear-gradient(180deg, #e2c08a, #c9a96e)' }} />
                                    )}
                                    <Icon size={15} style={{ color: active ? '#c9a96e' : 'inherit', flexShrink: 0 }} />
                                    <span className="truncate">{label}</span>
                                    {active && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full"
                                            style={{ background: '#c9a96e', boxShadow: '0 0 6px rgba(201,169,110,0.6)' }} />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* ── Footer ── */}
            <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid var(--admin-sidebar-border)' }}>
                <GamificationWidget />
                
                <Link to="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all mb-1"
                    style={{ color: 'rgba(255,255,255,0.28)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; e.currentTarget.style.background = 'transparent'; }}>
                    <ArrowLeft size={13} /> Về trang chủ
                </Link>

                {/* User row */}
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mt-1"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, #c9a96e, #e2c08a)',
                            boxShadow: '0 0 0 2px rgba(201,169,110,0.3)',
                        }}>
                        {user?.name?.[0] || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
                            {user?.name || 'Admin'}
                        </p>
                        <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>
                            {user?.email}
                        </p>
                    </div>
                    <button onClick={logout} title="Đăng xuất"
                        className="p-1.5 rounded-lg transition-all flex-shrink-0"
                        style={{ color: 'rgba(255,255,255,0.25)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; }}>
                        <LogOut size={13} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: 'var(--admin-content-bg)' }}>
            {/* ── Desktop Sidebar ── */}
            <aside className="w-[220px] flex-shrink-0 hidden md:flex flex-col overflow-hidden shadow-2xl"
                style={{
                    background: 'var(--admin-sidebar-bg)',
                    boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
                }}>
                <SidebarNav />
            </aside>

            {/* ── Mobile Overlay ── */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <div className="relative w-[220px] h-full flex-shrink-0 admin-fade-in shadow-2xl">
                        <SidebarNav onClose={() => setMobileOpen(false)} />
                    </div>
                </div>
            )}

            {/* ── Main Area ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* ── Topbar ── */}
                <header className="flex-shrink-0 h-14 flex items-center px-6 gap-4 z-10 bg-white"
                    style={{
                        borderBottom: '1px solid #e8e8f0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    }}>
                    {/* Mobile hamburger */}
                    <button className="md:hidden p-1.5 rounded-lg hover:bg-black/5 transition text-[#6b6b80]"
                        onClick={() => setMobileOpen(true)}>
                        <Menu size={20} />
                    </button>

                    {/* Breadcrumbs */}
                    <div className="hidden md:flex items-center gap-2 text-[13px] font-medium">
                        <span className="text-[#9999b0]">Trang chủ</span>
                        <ChevronRight size={14} className="text-[#d1d1e0]" />
                        <span className="text-[#0d0e17] font-bold">
                            {NAV_GROUPS.flatMap(g => g.items).find(i => isActive(i.path))?.label || 'Tổng quan'}
                        </span>
                    </div>

                    {/* Global Search */}
                    <div className="flex-1 max-w-[400px] mx-auto hidden md:block ml-8">
                        <div className="relative group cursor-text" onClick={() => setPaletteOpen(true)}>
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9999b0]" />
                            <div className="w-full bg-[#f8f8fc] border border-transparent hover:border-[#e8e8f0] rounded-xl pl-9 pr-4 py-2 flex items-center justify-between transition-all">
                                <span className="text-[13px] font-medium text-[#9999b0]">Tìm kiếm hoặc điều hướng...</span>
                                <kbd className="px-1.5 py-0.5 text-[10px] font-bold font-mono text-[#9999b0] bg-white rounded border border-[#e8e8f0]">⌘K</kbd>
                            </div>
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        {/* Offline Indicator */}
                        {isOffline && (
                            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-[12px] font-bold shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span>Offline (Chế độ ngoại tuyến)</span>
                            </div>
                        )}

                        {/* Quick Create Button */}
                        <button className="hidden sm:flex items-center gap-1.5 bg-[#0d0e17] hover:bg-black text-white px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all shadow-sm">
                            <Sparkles size={14} className="text-[#c9a96e]" />
                            <span>Tạo mới</span>
                        </button>

                        <div className="w-px h-5 mx-1 bg-[#e8e8f0]" />

                        {/* Notifications */}
                        <NotificationCenter />

                        {/* User Profile */}
                        <div className="flex items-center gap-2.5 pl-2 cursor-pointer group">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white uppercase shadow-sm"
                                style={{ background: 'linear-gradient(135deg, #c9a96e, #e2c08a)' }}>
                                {user?.name?.[0] || 'A'}
                            </div>
                            <div className="hidden sm:block text-left">
                                <div className="text-[13px] font-bold text-[#0d0e17] leading-none mb-1 group-hover:text-[#c9a96e] transition-colors">{user?.name || 'Admin'}</div>
                                <div className="text-[11px] font-medium text-[#9999b0] leading-none">Quản trị viên</div>
                            </div>
                            <ChevronDown size={14} className="text-[#9999b0] hidden sm:block" />
                        </div>
                    </div>
                </header>

                {/* ── Page Content ── */}
                <main className="flex-1 overflow-y-auto admin-scroll" style={{ background: 'var(--admin-content-bg)' }}>
                    <div className="admin-fade-in">
                        {children}
                    </div>
                </main>
            </div>

            {/* Global Modals */}
            <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
        </div>
    );
}
