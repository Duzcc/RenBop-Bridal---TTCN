import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, ShoppingBag, Users, Package, CheckCircle2 } from 'lucide-react';

/* ─── Mock notifications (thay bằng API thật nếu có) ─── */
const MOCK_NOTIFS = [
    { id: 1, type: 'order',   title: 'Đơn hàng mới #1042', body: 'Khách Trần Thị Hoa vừa đặt đơn 4.500.000đ', time: '2 phút trước', read: false },
    { id: 2, type: 'user',    title: 'Khách hàng mới đăng ký', body: 'Nguyễn Minh Châu — nguyenchau@email.com', time: '18 phút trước', read: false },
    { id: 3, type: 'order',   title: 'Đơn #1038 đã hoàn thành', body: 'Nhân viên Lan xác nhận giao thành công', time: '1 giờ trước', read: true },
    { id: 4, type: 'product', title: 'Sắp hết hàng', body: 'Váy Cưới Luxury A-Line chỉ còn 1 chiếc', time: '2 giờ trước', read: true },
    { id: 5, type: 'order',   title: 'Đơn #1035 yêu cầu trả đồ', body: 'Khách Lê Thu Hằng gửi yêu cầu trả đồ', time: '3 giờ trước', read: true },
];

const TYPE_ICON = {
    order:   { icon: ShoppingBag, bg: 'bg-[#c9a96e]/10', color: 'text-[#c9a96e]' },
    user:    { icon: Users,       bg: 'bg-blue-50',       color: 'text-blue-600' },
    product: { icon: Package,     bg: 'bg-purple-50',     color: 'text-purple-600' },
};

const NotificationCenter = () => {
    const [open, setOpen] = useState(false);
    const [notifs, setNotifs] = useState(MOCK_NOTIFS);
    const ref = useRef(null);

    const unreadCount = notifs.filter(n => !n.read).length;

    /* Close on outside click */
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    return (
        <div className="relative" ref={ref}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="relative p-2 rounded-xl text-[#6b6b80] hover:bg-[#f8f8fc] hover:text-[#0d0e17] transition-all"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl shadow-2xl border border-[#e8e8f0] z-[200] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#f4f4f8]">
                        <div>
                            <h3 className="text-[14px] font-black text-[#0d0e17]">Thông báo</h3>
                            {unreadCount > 0 && (
                                <p className="text-[11px] font-bold text-[#c9a96e]">{unreadCount} chưa đọc</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button onClick={markAllRead}
                                    className="flex items-center gap-1 text-[11px] font-bold text-[#6b6b80] hover:text-[#0d0e17] px-2 py-1 rounded-lg hover:bg-[#f4f4f8] transition-colors">
                                    <CheckCircle2 size={13} /> Đọc tất cả
                                </button>
                            )}
                            <button onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg text-[#9999b0] hover:bg-[#f4f4f8] hover:text-[#0d0e17] transition-colors">
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-[#f4f4f8]">
                        {notifs.map(n => {
                            const cfg = TYPE_ICON[n.type] || TYPE_ICON.order;
                            const Icon = cfg.icon;
                            return (
                                <button key={n.id} onClick={() => markRead(n.id)}
                                    className={`w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-[#f8f8fc] transition-colors ${!n.read ? 'bg-[#fef9f2]' : ''}`}>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                                        <Icon size={16} className={cfg.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-[13px] leading-tight ${n.read ? 'font-medium text-[#6b6b80]' : 'font-bold text-[#0d0e17]'}`}>
                                                {n.title}
                                            </p>
                                            {!n.read && <span className="w-2 h-2 rounded-full bg-[#c9a96e] shrink-0 mt-1" />}
                                        </div>
                                        <p className="text-[11px] text-[#9999b0] font-medium mt-0.5 leading-snug">{n.body}</p>
                                        <p className="text-[10px] text-[#c9a96e] font-bold mt-1">{n.time}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-[#f4f4f8] bg-[#f8f8fc]">
                        <button className="w-full text-center text-[12px] font-bold text-[#6b6b80] hover:text-[#0d0e17] transition-colors py-1">
                            Xem toàn bộ thông báo →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
