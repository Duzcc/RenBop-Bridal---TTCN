import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../../utils/apiClient';
import { useToast } from '../../context/ToastContext';
import { downloadCSV } from '../../utils/exportUtils';
import {
    Loader2, RefreshCw, CreditCard, Search, X, 
    ChevronRight, Calendar, User, ShoppingBag,
    CheckCircle2, Clock, Ban, Filter, DollarSign,
    ArrowUpRight, Download, ExternalLink, ShieldCheck
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';

/* ─── Config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
    PENDING:   { label: 'Chờ thanh toán', color: 'bg-amber-50   text-amber-700   border-amber-200',    dot: '#f59e0b' },
    COMPLETED: { label: 'Thành công',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200',  dot: '#10b981' },
    FAILED:    { label: 'Thất bại',      color: 'bg-red-50     text-red-700     border-red-200',      dot: '#ef4444' },
    REFUNDED:  { label: 'Hoàn tiền',     color: 'bg-gray-50    text-gray-700    border-gray-200',     dot: '#6b7280' },
};

const METHOD_CONFIG = {
    CASH:           { label: 'Tiền mặt',      icon: DollarSign, color: 'text-emerald-600' },
    BANK_TRANSFER:  { label: 'Chuyển khoản',  icon: ShieldCheck, color: 'text-blue-600' },
    VN_PAY:         { label: 'VNPay',         icon: CreditCard,  color: 'text-indigo-600' },
    MOMO:           { label: 'Ví MoMo',       icon: ShoppingBag, color: 'text-pink-600' },
    CREDIT_CARD:    { label: 'Thẻ tín dụng',   icon: CreditCard,  color: 'text-purple-600' },
};

const ManagePayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const { showToast }           = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selected, setSelected] = useState(null);
    const [refunding, setRefunding] = useState(null);

    useEffect(() => { fetchPayments(); }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await apiClient('/admin/payments');
            if (res.success) setPayments(res.data || []);
        } catch (err) {
            showToast('❌ Không thể tải lịch sử giao dịch');
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async (paymentId) => {
        if (!window.confirm('Xác nhận hoàn tiền cho giao dịch này?')) return;
        setRefunding(paymentId);
        try {
            const res = await apiClient(`/admin/payments/${paymentId}/refund`, { method: 'POST' });
            if (res.success) {
                setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'REFUNDED' } : p));
                if (selected?.id === paymentId) setSelected(s => ({ ...s, status: 'REFUNDED' }));
                showToast('✅ Đã xử lý hoàn tiền thành công');
            }
        } catch (err) { showToast(`❌ Lỗi hoàn tiền: ${err.message}`); }
        finally { setRefunding(null); }
    };

    const filtered = useMemo(() => {
        return payments.filter(p => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                p.id.toString().includes(q) ||
                p.orderId.toString().includes(q) ||
                p.customerName?.toLowerCase().includes(q) ||
                p.transactionId?.toLowerCase().includes(q);
            const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
            return matchSearch && matchStatus;
        }).sort((a, b) => b.id - a.id);
    }, [payments, search, filterStatus]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const counts = useMemo(() => {
        const c = {};
        Object.keys(STATUS_CONFIG).forEach(k => { c[k] = payments.filter(p => p.status === k).length; });
        return c;
    }, [payments]);

    const stats = useMemo(() => {
        const total = payments.filter(p => p.status === 'COMPLETED').reduce((acc, p) => acc + p.amount, 0);
        const count = payments.filter(p => p.status === 'COMPLETED').length;
        return { total, count };
    }, [payments]);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="w-full h-full flex flex-col p-6 space-y-4 font-sans bg-[#f4f4f8]">
            {/* Header & Stats Compact */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#0d0e17]">Lịch sử Giao dịch</h1>
                    <p className="text-[12px] font-medium text-[#6b6b80] mt-0.5">Hiển thị {filtered.length} trên tổng số {payments.length} giao dịch</p>
                </div>
                
                {/* Compact Stats */}
                <div className="hidden lg:flex items-center gap-4 bg-white rounded-xl border border-[#e8e8f0] px-4 py-2 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><ArrowUpRight size={12} /></div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#9999b0] leading-none mb-0.5">Doanh thu</p>
                            <p className="text-[14px] font-mono font-black text-[#0d0e17] leading-none">{formatCurrency(stats.total)}</p>
                        </div>
                    </div>
                    <div className="w-px h-6 bg-[#e8e8f0]" />
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><CheckCircle2 size={12} /></div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#9999b0] leading-none mb-0.5">Thành công</p>
                            <p className="text-[14px] font-black text-[#0d0e17] leading-none">{stats.count}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={fetchPayments} className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e8e8f0] rounded-xl text-[12px] font-bold hover:bg-[#f8f8fc] transition-all shadow-sm">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => {
                        const headers = [
                            { key: 'transactionId', label: 'Mã Giao dịch' },
                            { key: 'orderId', label: 'Mã Đơn hàng' },
                            { key: 'customerName', label: 'Khách hàng' },
                            { key: 'method', label: 'Phương thức' },
                            { key: 'amount', label: 'Số tiền (VNĐ)' },
                            { key: 'status', label: 'Trạng thái' },
                            { key: 'createdAt', label: 'Ngày thực hiện' }
                        ];
                        downloadCSV(filtered, headers, `Lich_su_giao_dich_${new Date().toISOString().split('T')[0]}.csv`);
                    }} className="flex items-center gap-1.5 bg-[#0d0e17] hover:bg-black text-white px-4 py-2 rounded-xl text-[12px] font-bold transition-all shadow-sm">
                        <Download size={14} /> Xuất Báo cáo
                    </button>
                </div>
            </div>

            {/* Main Seamless Table Container */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#e8e8f0] shadow-sm overflow-hidden">
                
                {/* Advanced Filter Toolbar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f4f4f8] bg-white">
                    <div className="relative flex-[2] max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9999b0]" />
                        <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder="Tìm mã giao dịch, mã đơn..."
                            className="w-full pl-8 pr-3 py-1.5 bg-[#f8f8fc] border border-transparent rounded-lg text-[13px] outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                    </div>
                    <div className="h-5 w-px bg-[#e8e8f0]" />
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {[{val:'ALL',label:'Tất cả'}, ...Object.entries(STATUS_CONFIG).map(([k,v])=>({val:k,label:v.label}))].map(({val,label}) => (
                            <button key={val} onClick={() => { setFilterStatus(val); setCurrentPage(1); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${filterStatus === val ? 'bg-[#f4f4f8] text-[#0d0e17]' : 'text-[#6b6b80] hover:bg-[#f8f8fc]'}`}>
                                {label}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${filterStatus === val ? 'bg-[#e8e8f0] text-[#0d0e17]' : 'bg-[#f4f4f8] text-[#9999b0]'}`}>
                                    {val === 'ALL' ? payments.length : (counts[val] || 0)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Table */}
                <div className="flex-1 overflow-auto admin-scroll bg-[#f8f8fc]">
                    <table className="w-full text-left text-[13px] border-collapse">
                        <thead className="bg-white sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Giao dịch</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Đơn hàng</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Khách hàng</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Phương thức</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Số tiền</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Trạng thái</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0] text-right">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {loading ? (
                                <tr><td colSpan="7" className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-[#c9a96e]" size={24} /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="7" className="py-16 text-center text-[#9999b0] font-medium text-[13px]">Không tìm thấy dữ liệu giao dịch</td></tr>
                            ) : paginated.map(p => (
                                <tr key={p.id} onClick={() => setSelected(p)} className="hover:bg-[#f8f8fc] border-b border-[#f4f4f8] transition-colors cursor-pointer group">
                                    <td className="px-5 py-3">
                                        <div className="font-mono font-bold text-[#0d0e17] text-[13px] truncate max-w-[150px]">
                                            {p.transactionId || `TXN-${p.id}`}
                                        </div>
                                        <div className="text-[11px] text-[#9999b0] mt-0.5">{formatDate(p.createdAt).split(',')[0]}</div>
                                    </td>
                                    <td className="px-5 py-3 font-mono font-bold text-[#c9a96e] text-[12px]">#{p.orderId}</td>
                                    <td className="px-5 py-3">
                                        <div className="font-bold text-[#0d0e17]">{p.customerName || 'N/A'}</div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            {(() => {
                                                const config = METHOD_CONFIG[p.method];
                                                if (!config) return <span className="font-bold text-[#6b6b80]">{p.method}</span>;
                                                const Icon = config.icon;
                                                return (
                                                    <>
                                                        <Icon size={12} className={config.color} />
                                                        <span className="font-bold text-[#6b6b80] text-[11px] uppercase">{config.label}</span>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 font-mono font-bold text-[#0d0e17] text-[12px]">{formatCurrency(p.amount)}</td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold ${STATUS_CONFIG[p.status]?.color || ''}`}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CONFIG[p.status]?.dot || '#999' }} />
                                            {STATUS_CONFIG[p.status]?.label || p.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button className="p-1.5 hover:bg-[#e8e8f0] rounded-lg text-[#9999b0] hover:text-[#0d0e17] transition-all opacity-0 group-hover:opacity-100 duration-200">
                                            <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                <div className="px-6 py-3 border-t border-[#e8e8f0] text-[11px] font-bold text-[#9999b0] bg-white uppercase tracking-wider flex justify-between items-center">
                    <div>Hiển thị <span className="text-[#0d0e17]">{filtered.length}</span> giao dịch</div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Thành công</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Chờ xử lý</div>
                    </div>
                </div>
            </div>

            {/* Detail Drawer */}
            {selected && createPortal(
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0b0c17]/60 backdrop-blur-sm p-4 transition-opacity" onClick={() => setSelected(null)}>
                    <div className="bg-white w-full max-w-[600px] h-auto max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-8 py-6 border-b border-[#f4f4f8] shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-[#0d0e17]">Chi tiết Giao dịch</h2>
                                <p className="text-[13px] font-mono font-bold text-[#c9a96e] mt-0.5">#{selected.transactionId || selected.id}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2.5 bg-[#f4f4f8] hover:bg-[#e8e8f0] rounded-full text-[#6b6b80] transition-colors shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto admin-scroll p-8 bg-[#f8f8fc] space-y-6">
                            {/* Receipt Card */}
                            <div className="bg-white rounded-3xl border border-[#e8e8f0] p-8 shadow-sm flex flex-col items-center text-center space-y-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <ShieldCheck size={120} />
                                </div>
                                
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${STATUS_CONFIG[selected.status]?.color} bg-opacity-20`}>
                                    {selected.status === 'COMPLETED' ? <CheckCircle2 size={40} /> : <Clock size={40} />}
                                </div>
                                
                                <div>
                                    <div className="text-[13px] font-black text-[#9999b0] uppercase tracking-widest mb-1">Số tiền thanh toán</div>
                                    <div className="text-4xl font-black text-[#0d0e17]">{formatCurrency(selected.amount)}</div>
                                </div>

                                <div className={`px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-tight border ${STATUS_CONFIG[selected.status]?.color}`}>
                                    {STATUS_CONFIG[selected.status]?.label}
                                </div>
                            </div>

                            {/* Info Rows */}
                            <div className="bg-white rounded-3xl border border-[#e8e8f0] shadow-sm divide-y divide-[#f4f4f8]">
                                <div className="p-6 flex justify-between items-center">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Mã Đơn hàng</span>
                                    <span className="font-black text-[#c9a96e]">#{selected.orderId}</span>
                                </div>
                                <div className="p-6 flex justify-between items-center">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Khách hàng</span>
                                    <span className="font-bold text-[#0d0e17]">{selected.customerName || 'N/A'}</span>
                                </div>
                                <div className="p-6 flex justify-between items-center">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Phương thức</span>
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const config = METHOD_CONFIG[selected.method];
                                            if (!config) return <span className="font-bold text-[#0d0e17]">{selected.method}</span>;
                                            const Icon = config.icon;
                                            return (
                                                <>
                                                    <Icon size={16} className={config.color} />
                                                    <span className="font-bold text-[#0d0e17]">{config.label}</span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div className="p-6 flex justify-between items-center">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Ngày thực hiện</span>
                                    <span className="font-medium text-[#6b6b80]">{formatDate(selected.createdAt)}</span>
                                </div>
                                <div className="p-6 flex justify-between items-center">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Mã giao dịch</span>
                                    <span className="font-mono font-bold text-[#0d0e17]">{selected.transactionId || '—'}</span>
                                </div>
                            </div>

                            <button className="w-full p-4 bg-[#f8f8fc] border border-dashed border-[#d0d0d0] rounded-2xl flex items-center justify-center gap-3 text-[13px] font-bold text-[#6b6b80] hover:bg-white hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all">
                                <ExternalLink size={16} /> Xem đơn hàng chi tiết
                            </button>
                        </div>

                        <div className="px-8 py-6 border-t border-[#f4f4f8] bg-white shrink-0 flex gap-3">
                            <button onClick={() => setSelected(null)}
                                className="flex-1 px-6 py-3.5 bg-[#f4f4f8] hover:bg-[#e8e8f0] text-[#0d0e17] rounded-2xl font-bold transition-all text-[13px]">
                                Đóng
                            </button>
                            {selected.status === 'COMPLETED' && (
                                <button onClick={() => handleRefund(selected.id)} disabled={refunding === selected.id}
                                    className="flex-1 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black transition-all text-[13px] flex items-center justify-center gap-2 disabled:opacity-60">
                                    {refunding === selected.id
                                        ? <><Loader2 size={15} className="animate-spin" /> Đang xử lý...</>
                                        : <>↩ Hoàn tiền</>}
                                </button>
                            )}
                            {selected.status === 'COMPLETED' && (
                                <button className="flex-1 px-6 py-3.5 bg-[#0d0e17] text-white rounded-2xl font-black transition-all text-[13px] flex items-center justify-center gap-2">
                                    <Download size={16} /> In hóa đơn
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ManagePayments;
