import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../../utils/apiClient';
import { useToast } from '../../context/ToastContext';
import { downloadCSV } from '../../utils/exportUtils';
import {
    Loader2, RefreshCw, ShoppingBag, Search, X, 
    ChevronRight, Calendar, User, Mail, Phone,
    Package, CreditCard, ChevronDown, CheckCircle2,
    Clock, Ban, Filter, MoreHorizontal, Download, Printer
} from 'lucide-react';

/* ─── Config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
    PENDING:     { label: 'Chờ xử lý',   color: 'bg-amber-50   text-amber-700   border-amber-200',    dot: '#f59e0b' },
    IN_PROGRESS: { label: 'Đang xử lý',  color: 'bg-blue-50    text-blue-700    border-blue-200',     dot: '#3b82f6' },
    COMPLETED:   { label: 'Hoàn thành',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200',  dot: '#10b981' },
    CANCELLED:   { label: 'Đã hủy',      color: 'bg-red-50     text-red-700     border-red-200',      dot: '#ef4444' },
};

const TYPE_CONFIG = {
    RENTAL:    { label: 'Thuê đồ',   bg: 'bg-purple-50',  text: 'text-purple-700' },
    TAILORING: { label: 'May đo',    bg: 'bg-rose-50',    text: 'text-rose-700' },
    PURCHASE:  { label: 'Mua đứt',   bg: 'bg-blue-50',    text: 'text-blue-700' },
};

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const { showToast } = useToast();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchOrders();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search, filterStatus, filterType, fromDate, toDate]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let query = '/admin/orders?size=200';
            if (filterStatus !== 'ALL') query += `&status=${filterStatus}`;
            if (filterType !== 'ALL') query += `&orderType=${filterType}`;
            if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
            if (fromDate) query += `&from=${fromDate}`;
            if (toDate) query += `&to=${toDate}`;
            
            const res = await apiClient(query);
            if (res.success) setOrders(res.data?.content || []);
            else setOrders([]);
        } catch (err) {
            showToast('❌ Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            const res = await apiClient(`/admin/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            if (res.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
                showToast(`✅ Cập nhật đơn #${orderId} → ${STATUS_CONFIG[newStatus].label}`);
            }
        } catch (err) {
            showToast(`❌ Lỗi: ${err.message}`);
        } finally {
            setUpdating(null);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm(`Hủy đơn hàng #${orderId}? Hành động không thể hoàn tác.`)) return;
        await handleUpdateStatus(orderId, 'CANCELLED');
    };

    const handleExportCSV = () => {
        if (!filtered.length) return;
        const rows = filtered.map(o => ({
            'Mã đơn': o.id,
            'Khách hàng': o.customerName,
            'Loại': TYPE_CONFIG[o.orderType]?.label || o.orderType,
            'Trạng thái': STATUS_CONFIG[o.status]?.label || o.status,
            'Tổng tiền': o.totalPrice,
            'Ngày tạo': o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '',
        }));
        downloadCSV(rows, `don_hang_${Date.now()}.csv`);
        showToast('✅ Đã xuất danh sách đơn hàng');
    };

    const filtered = orders;

    const counts = useMemo(() => {
        const c = { TOTAL: orders.length };
        Object.keys(STATUS_CONFIG).forEach(k => {
            c[k] = orders.filter(o => o.status === k).length;
        });
        return c;
    }, [orders]);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <>
        <div className="w-full h-full flex flex-col p-6 space-y-4 font-sans bg-[#f4f4f8] print:hidden">
            {/* Header & Stats Compact */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#0d0e17]">Quản lý Đơn hàng</h1>
                    <p className="text-[12px] font-medium text-[#6b6b80] mt-0.5">Hiển thị {filtered.length} trên tổng số {orders.length} đơn</p>
                </div>
                
                {/* Compact Stats */}
                <div className="hidden lg:flex items-center gap-2 bg-white rounded-xl border border-[#e8e8f0] p-1.5 shadow-sm">
                    {[
                        { key: 'PENDING', icon: Clock, label: 'Chờ xử lý' },
                        { key: 'IN_PROGRESS', icon: Filter, label: 'Đang xử lý' },
                        { key: 'COMPLETED', icon: CheckCircle2, label: 'Đã xong' }
                    ].map(item => (
                        <div key={item.key} 
                            onClick={() => setFilterStatus(filterStatus === item.key ? 'ALL' : item.key)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${filterStatus === item.key ? 'bg-[#f8f8fc] ring-1 ring-[#c9a96e]' : 'hover:bg-[#f8f8fc]'}`}>
                            <div className={`w-2 h-2 rounded-full`} style={{ background: STATUS_CONFIG[item.key].dot }} />
                            <span className="text-[12px] font-bold text-[#0d0e17]">{counts[item.key] || 0}</span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button onClick={fetchOrders} className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e8e8f0] rounded-xl text-[12px] font-bold hover:bg-[#f8f8fc] transition-all shadow-sm">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#0d0e17] hover:bg-black text-white rounded-xl text-[12px] font-bold transition-all shadow-sm">
                        <ShoppingBag size={14} /> Xuất CSV
                    </button>
                </div>
            </div>

            {/* Main Seamless Table Container */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#e8e8f0] shadow-sm overflow-hidden">
                
                {/* Advanced Filter Toolbar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f4f4f8] bg-white flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9999b0]" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm mã đơn, khách hàng..."
                            className="w-full pl-8 pr-3 py-1.5 bg-[#f8f8fc] border border-transparent rounded-lg text-[13px] outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                    </div>
                    <div className="h-5 w-px bg-[#e8e8f0] hidden md:block" />
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {['ALL', 'RENTAL', 'TAILORING', 'PURCHASE'].map(t => (
                            <button key={t} onClick={() => setFilterType(t)}
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${filterType === t ? 'bg-[#f4f4f8] text-[#0d0e17]' : 'text-[#6b6b80] hover:bg-[#f8f8fc]'}`}>
                                {t === 'ALL' ? 'Tất cả loại' : TYPE_CONFIG[t].label}
                            </button>
                        ))}
                    </div>
                    <div className="h-5 w-px bg-[#e8e8f0] hidden md:block" />
                    <div className="flex items-center gap-2">
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                            className="bg-[#f8f8fc] border border-transparent rounded-lg text-[12px] font-bold text-[#0d0e17] px-2 py-1.5 outline-none hover:bg-[#f0f0f5] transition-all" title="Từ ngày" />
                        <span className="text-[#9999b0] text-[12px]">-</span>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                            className="bg-[#f8f8fc] border border-transparent rounded-lg text-[12px] font-bold text-[#0d0e17] px-2 py-1.5 outline-none hover:bg-[#f0f0f5] transition-all" title="Đến ngày" />
                    </div>
                    <div className="ml-auto relative">
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="appearance-none bg-[#f8f8fc] border border-transparent rounded-lg text-[12px] font-bold text-[#0d0e17] px-3 py-1.5 pr-7 outline-none hover:bg-[#f0f0f5] cursor-pointer transition-all">
                            <option value="ALL">Mọi trạng thái</option>
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9999b0] pointer-events-none" />
                    </div>
                </div>

                {/* Data Table */}
                <div className="flex-1 overflow-auto admin-scroll bg-[#f8f8fc]">
                    <table className="w-full text-left text-[13px] border-collapse">
                        <thead className="bg-white sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Đơn hàng</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Khách hàng</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Loại</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Tổng tiền</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Trạng thái</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0] text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {loading ? (
                                <tr><td colSpan="6" className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-[#c9a96e]" size={24} /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="py-16 text-center text-[#9999b0] font-medium text-[13px]">Không có dữ liệu</td></tr>
                            ) : filtered.map(o => (
                                <tr key={o.id} onClick={() => setSelectedOrder(o)} className="hover:bg-[#f8f8fc] border-b border-[#f4f4f8] transition-colors cursor-pointer group">
                                    <td className="px-5 py-3">
                                        <div className="font-mono font-bold text-[#0d0e17] text-[13px]">#{o.id}</div>
                                        <div className="text-[11px] text-[#9999b0] mt-0.5">{formatDate(o.createdAt).split(',')[0]}</div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="font-bold text-[#0d0e17]">{o.customerName}</div>
                                        <div className="text-[11px] text-[#9999b0]">{o.customerEmail}</div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${TYPE_CONFIG[o.orderType].bg} ${TYPE_CONFIG[o.orderType].text}`}>
                                            {TYPE_CONFIG[o.orderType].label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 font-mono font-bold text-[#0d0e17]">
                                        {formatCurrency(o.totalAmount)}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold ${STATUS_CONFIG[o.status].color}`}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CONFIG[o.status].dot }} />
                                            {STATUS_CONFIG[o.status].label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                        <div className="relative inline-block opacity-40 group-hover:opacity-100 transition-opacity">
                                            <select value={o.status} onChange={e => handleUpdateStatus(o.id, e.target.value)} disabled={updating === o.id}
                                                className="appearance-none bg-white hover:bg-[#f8f8fc] border border-[#e8e8f0] rounded-lg text-[11px] font-bold px-2.5 py-1.5 pr-6 outline-none focus:border-[#c9a96e] cursor-pointer transition-all focus:ring-2 focus:ring-[#c9a96e]/20">
                                                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                                    <option key={key} value={key}>{cfg.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9999b0] pointer-events-none" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Order Detail Drawer */}
            {selectedOrder && createPortal(
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0b0c17]/60 backdrop-blur-sm p-4 transition-opacity print:hidden" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white w-full max-w-[800px] h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-8 py-6 border-b border-[#f4f4f8] shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-[#0d0e17]">Chi tiết Đơn hàng</h2>
                                <p className="text-[13px] font-mono font-bold text-[#c9a96e] mt-0.5">#{selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2.5 bg-[#f4f4f8] hover:bg-[#e8e8f0] rounded-full text-[#6b6b80] transition-colors shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto admin-scroll p-8 bg-[#f8f8fc] space-y-6">
                            {/* ── Status Timeline ── */}
                            <div className="bg-white rounded-3xl border border-[#e8e8f0] p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Tiến trình đơn hàng</div>
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${STATUS_CONFIG[selectedOrder.status]?.color}`}>
                                        {STATUS_CONFIG[selectedOrder.status]?.label}
                                    </span>
                                </div>
                                {/* Vertical Stepper */}
                                <div className="relative pl-6">
                                    {/* Connector line */}
                                    <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-[#e8e8f0]" />
                                    {[
                                        { key: 'PENDING',     label: 'Chờ xử lý',  desc: 'Đơn hàng đã được tiếp nhận' },
                                        { key: 'IN_PROGRESS', label: 'Đang xử lý', desc: 'Nhân viên đang chuẩn bị đơn hàng' },
                                        { key: 'COMPLETED',   label: 'Hoàn thành', desc: 'Đơn hàng đã được hoàn tất' },
                                        { key: 'CANCELLED',   label: 'Đã hủy',     desc: 'Đơn hàng đã bị hủy' },
                                    ].map((step, idx) => {
                                        const statusOrder = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
                                        const currentIdx = statusOrder.indexOf(selectedOrder.status);
                                        const stepIdx    = statusOrder.indexOf(step.key);
                                        const isCurrent  = selectedOrder.status === step.key;
                                        const isPast     = stepIdx !== -1 && stepIdx < currentIdx;
                                        const isCancelled = selectedOrder.status === 'CANCELLED';
                                        const isActive   = isCurrent || isPast;
                                        if (step.key === 'CANCELLED' && !isCancelled) return null;
                                        if (step.key !== 'CANCELLED' && isCancelled && step.key !== 'PENDING') return null;
                                        return (
                                            <div key={step.key} className="relative flex items-start gap-4 pb-6 last:pb-0">
                                                {/* Dot */}
                                                <div className={`absolute -left-6 w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                                                    isCurrent ? 'border-[#c9a96e] bg-[#c9a96e]' :
                                                    isPast    ? 'border-emerald-500 bg-emerald-500' :
                                                    isCancelled && step.key === 'CANCELLED' ? 'border-red-400 bg-red-400' :
                                                                  'border-[#e8e8f0] bg-white'
                                                }`} style={{ left: '-1.5rem', top: '2px', width: '22px', height: '22px' }}>
                                                    {isPast && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                                    {isCurrent && !isCancelled && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                {/* Content */}
                                                <div className={`transition-all ${isActive ? 'opacity-100' : 'opacity-35'}`}>
                                                    <div className={`text-[13px] font-black ${isCurrent ? 'text-[#c9a96e]' : isPast ? 'text-emerald-600' : isCancelled && step.key === 'CANCELLED' ? 'text-red-500' : 'text-[#9999b0]'}`}>
                                                        {step.label}
                                                    </div>
                                                    <div className="text-[11px] font-medium text-[#9999b0] mt-0.5">{step.desc}</div>
                                                </div>
                                                {/* Change button */}
                                                {!isCurrent && step.key !== 'CANCELLED' && !isCancelled && (
                                                    <button onClick={() => handleUpdateStatus(selectedOrder.id, step.key)}
                                                        disabled={updating === selectedOrder.id}
                                                        className="ml-auto text-[10px] font-black px-3 py-1 bg-[#f4f4f8] hover:bg-[#c9a96e]/10 hover:text-[#c9a96e] rounded-lg transition-colors shrink-0 border border-transparent hover:border-[#c9a96e]/20 disabled:opacity-50">
                                                        Chuyển sang →
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Cancel button */}
                                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
                                    <button onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                                        disabled={updating === selectedOrder.id}
                                        className="mt-4 w-full py-2.5 text-[12px] font-black text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50">
                                        Hủy đơn hàng này
                                    </button>
                                )}
                            </div>

                            {/* Customer Info */}
                            <div className="bg-white rounded-3xl border border-[#e8e8f0] p-6 shadow-sm space-y-4">
                                <div className="text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Khách hàng</div>
                                <div className="flex items-center gap-4 p-4 bg-[#f8f8fc] rounded-2xl border border-[#f0f0f5]">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c9a96e] to-[#e2c08a] flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-[#c9a96e]/20 uppercase">
                                        {selectedOrder.customerName[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#0d0e17]">{selectedOrder.customerName}</div>
                                        <div className="text-[12px] text-[#6b6b80]">ID Khách: #{selectedOrder.customerId}</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-[13px] text-[#6b6b80]"><Mail size={14} /> {selectedOrder.customerEmail}</div>
                                    <div className="flex items-center gap-3 text-[13px] text-[#6b6b80]"><Phone size={14} /> {selectedOrder.customerPhone || 'N/A'}</div>
                                    <div className="flex items-center gap-3 text-[13px] text-[#6b6b80]"><Calendar size={14} /> Ngày đặt: {formatDate(selectedOrder.createdAt)}</div>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="bg-white rounded-3xl border border-[#e8e8f0] p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Sản phẩm ({selectedOrder.items?.length || 0})</div>
                                    <div className="text-[14px] font-black text-[#0d0e17]">{TYPE_CONFIG[selectedOrder.orderType].label}</div>
                                </div>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 bg-[#f8f8fc] rounded-2xl border border-[#f0f0f5] group">
                                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-[#e8e8f0] shadow-sm shrink-0">
                                                <Package size={24} className="text-[#c9a96e]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-[#0d0e17] truncate">{item.productName}</div>
                                                <div className="text-[11px] font-mono text-[#9999b0] mt-0.5">SKU: {item.sku}</div>
                                                {item.rentalStartDate && (
                                                    <div className="text-[10px] text-purple-600 font-bold mt-1 bg-purple-50 inline-block px-2 py-0.5 rounded">
                                                        {item.rentalStartDate} → {item.rentalEndDate}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="font-bold text-[#0d0e17]">{formatCurrency(item.price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 mt-4 border-t border-[#f4f4f8] space-y-2">
                                    <div className="flex justify-between text-[13px] text-[#6b6b80]"><span>Tạm tính:</span><span>{formatCurrency(selectedOrder.totalAmount)}</span></div>
                                    <div className="flex justify-between text-[13px] text-[#6b6b80]"><span>Giảm giá:</span><span>{formatCurrency(0)}</span></div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-bold text-[#0d0e17]">Tổng cộng:</span>
                                        <span className="text-xl font-black text-[#0d0e17]">{formatCurrency(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedOrder.note && (
                                <div className="bg-white rounded-3xl border border-[#e8e8f0] p-6 shadow-sm">
                                    <div className="text-[11px] font-black uppercase tracking-widest text-[#9999b0] mb-3">Ghi chú từ khách</div>
                                    <div className="p-4 bg-[#fff9eb] rounded-2xl border border-[#fff2d1] text-[13px] text-[#856404] font-medium leading-relaxed italic">
                                        "{selectedOrder.note}"
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-6 border-t border-[#f4f4f8] bg-white flex gap-3 shrink-0 flex-wrap">
                            <button onClick={() => setSelectedOrder(null)}
                                className="flex-1 min-w-[100px] px-6 py-3.5 bg-[#f4f4f8] hover:bg-[#e8e8f0] text-[#0d0e17] rounded-2xl font-bold transition-all text-[13px]">
                                Đóng
                            </button>
                            {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
                                <button onClick={() => handleCancelOrder(selectedOrder.id)} disabled={updating === selectedOrder.id}
                                    className="flex-1 min-w-[120px] px-6 py-3.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-2xl font-black transition-all text-[13px] flex items-center justify-center gap-2 disabled:opacity-60">
                                    {updating === selectedOrder.id ? <Loader2 size={15} className="animate-spin" /> : <Ban size={15} />}
                                    Hủy đơn
                                </button>
                            )}
                            <button onClick={() => window.print()}
                                className="flex-1 min-w-[120px] px-6 py-3.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-2xl font-black transition-all text-[13px] flex items-center justify-center gap-2">
                                <Printer size={15} /> In Hóa Đơn
                            </button>
                            <button onClick={() => {
                                const headers = [
                                    { key: 'id', label: 'Mã Đơn' },
                                    { key: 'customerName', label: 'Khách hàng' },
                                    { key: 'customerPhone', label: 'SĐT' },
                                    { key: 'orderType', label: 'Loại Đơn' },
                                    { key: 'totalAmount', label: 'Tổng Tiền (VNĐ)' },
                                    { key: 'status', label: 'Trạng thái' },
                                    { key: 'createdAt', label: 'Ngày Tạo' }
                                ];
                                downloadCSV(filtered, headers, `Danh_sach_don_hang_${new Date().toISOString().split('T')[0]}.csv`);
                            }} className="flex items-center gap-2 bg-[#0d0e17] hover:bg-black text-white px-5 py-3.5 rounded-2xl text-[13px] font-black transition-all shadow-lg shadow-black/20">
                                <Download size={16} /> Xuất CSV
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Printable Invoice (Only visible during print) */}
            {selectedOrder && createPortal(
                <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-10 font-sans text-black">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-widest mb-1">Renbo Bridal</h1>
                                <p className="text-sm font-medium text-gray-500">Luxury Bridal Boutique</p>
                                <p className="text-sm text-gray-500 mt-2">123 Nguyen Van Linh, Da Nang, VN</p>
                                <p className="text-sm text-gray-500">Phone: 0901 234 567</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest mb-2">Invoice</h2>
                                <p className="text-lg font-bold">Mã Đơn: #{selectedOrder.id}</p>
                                <p className="text-sm font-bold mt-1">Ngày: {formatDate(selectedOrder.createdAt).split(',')[0]}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-10 mb-10">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Khách Hàng</h3>
                                <p className="font-bold text-lg">{selectedOrder.customerName}</p>
                                <p className="text-gray-600 mt-1">{selectedOrder.customerEmail}</p>
                                <p className="text-gray-600">{selectedOrder.customerPhone || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Thông tin Đơn hàng</h3>
                                <p className="font-bold"><span className="text-gray-500 font-normal mr-2">Loại đơn:</span> {TYPE_CONFIG[selectedOrder.orderType]?.label}</p>
                                <p className="font-bold mt-1"><span className="text-gray-500 font-normal mr-2">Trạng thái:</span> {STATUS_CONFIG[selectedOrder.status]?.label}</p>
                            </div>
                        </div>

                        <table className="w-full text-left mb-10">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="py-3 font-black uppercase tracking-wider text-xs">Mô tả Sản phẩm</th>
                                    <th className="py-3 font-black uppercase tracking-wider text-xs text-center">SKU</th>
                                    <th className="py-3 font-black uppercase tracking-wider text-xs text-right">Đơn giá</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {selectedOrder.items?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-4">
                                            <p className="font-bold text-sm">{item.productName}</p>
                                            {item.rentalStartDate && <p className="text-xs text-gray-500 mt-1">Thuê: {item.rentalStartDate} → {item.rentalEndDate}</p>}
                                        </td>
                                        <td className="py-4 text-center text-sm font-mono text-gray-500">{item.sku}</td>
                                        <td className="py-4 text-right font-bold">{formatCurrency(item.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex justify-end border-t-2 border-gray-200 pt-6">
                            <div className="w-1/2">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500">Tạm tính:</span>
                                    <span className="font-bold">{formatCurrency(selectedOrder.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-4">
                                    <span className="text-gray-500">Giảm giá:</span>
                                    <span className="font-bold">{formatCurrency(0)}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                                    <span className="font-black uppercase tracking-widest">Tổng Thanh Toán:</span>
                                    <span className="text-2xl font-black">{formatCurrency(selectedOrder.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-20 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
                            <p>Cảm ơn quý khách đã tin tưởng và lựa chọn Renbo Bridal.</p>
                            <p className="mt-1">Mọi thắc mắc vui lòng liên hệ hotline: 0901 234 567.</p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default ManageOrders;
