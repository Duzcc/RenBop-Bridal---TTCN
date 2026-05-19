import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../../utils/apiClient';
import { useToast } from '../../context/ToastContext';
import {
    Loader2, RefreshCw, RotateCcw, Search, X, 
    ChevronRight, Calendar, User, Package,
    ShieldAlert, CreditCard, ChevronDown, CheckCircle2,
    Clock, Ban, Filter, AlertTriangle
} from 'lucide-react';

/* ─── Config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
    ON_TIME: { label: 'Đúng hạn', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: '#10b981' },
    LATE:    { label: 'Trễ hạn',  color: 'bg-amber-50   text-amber-700   border-amber-200',    dot: '#f59e0b' },
    DAMAGED: { label: 'Hư hỏng',  color: 'bg-red-50     text-red-700     border-red-200',      dot: '#ef4444' },
};

const ManageReturns = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const { showToast }         = useToast();
    const [selected, setSelected] = useState(null);

    // Damage form state
    const [showDamageForm, setShowDamageForm] = useState(false);
    const [damageForm, setDamageForm] = useState({ productItemId: '', description: '', repairCost: '', chargedToCustomer: true });
    const [submittingDamage, setSubmittingDamage] = useState(false);

    useEffect(() => { fetchReturns(); }, []);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const res = await apiClient('/returns');
            if (res.success) setReturns(res.data || []);
        } catch (err) {
            showToast('❌ Không thể tải danh sách phiếu trả');
        } finally {
            setLoading(false);
        }
    };

    const handleReportDamage = async (e) => {
        e.preventDefault();
        if (!damageForm.productItemId || !damageForm.description || !damageForm.repairCost) return;
        setSubmittingDamage(true);
        try {
            const res = await apiClient(`/damages/return/${selected.id}/product-item/${damageForm.productItemId}`, {
                method: 'POST',
                body: JSON.stringify({
                    description: damageForm.description,
                    repairCost: Number(damageForm.repairCost),
                    chargedToCustomer: damageForm.chargedToCustomer
                })
            });
            if (res.success) {
                showToast('✅ Đã ghi nhận hư hỏng');
                setShowDamageForm(false);
                setDamageForm({ productItemId: '', description: '', repairCost: '', chargedToCustomer: true });
                fetchReturns();
                setSelected(prev => ({...prev, damages: [...(prev.damages||[]), res.data]}));
            }
        } catch (err) {
            showToast(err.message || '❌ Lỗi khi báo cáo hư hỏng');
        } finally {
            setSubmittingDamage(false);
        }
    };

    const filtered = useMemo(() => {
        return returns.filter(r => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                r.id.toString().includes(q) ||
                r.orderId.toString().includes(q) ||
                r.customerName?.toLowerCase().includes(q);
            const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
            return matchSearch && matchStatus;
        }).sort((a, b) => b.id - a.id);
    }, [returns, search, filterStatus]);

    const counts = useMemo(() => {
        const c = {};
        Object.keys(STATUS_CONFIG).forEach(k => { c[k] = returns.filter(r => r.status === k).length; });
        return c;
    }, [returns]);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? dateStr : d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="w-full h-full flex flex-col p-6 space-y-4 font-sans bg-[#f4f4f8]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#0d0e17]">Quản lý Trả đồ</h1>
                    <p className="text-[12px] font-medium text-[#6b6b80] mt-0.5">
                        Hiển thị {filtered.length} trên tổng số {returns.length} phiếu trả đồ
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchReturns} className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e8e8f0] rounded-xl text-[12px] font-bold hover:bg-[#f8f8fc] transition-all shadow-sm">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Main Seamless Table Container */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#e8e8f0] shadow-sm overflow-hidden">
                {/* Search */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f4f4f8] bg-white">
                    <div className="relative flex-[2] max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9999b0]" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm mã phiếu, mã đơn, tên khách..."
                            className="w-full pl-8 pr-3 py-1.5 bg-[#f8f8fc] border border-transparent rounded-lg text-[13px] outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                    </div>
                    <div className="h-5 w-px bg-[#e8e8f0]" />
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {[{val:'ALL',label:'Tất cả'}, ...Object.entries(STATUS_CONFIG).map(([k,v])=>({val:k,label:v.label}))].map(({val,label}) => (
                            <button key={val} onClick={() => setFilterStatus(val)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${filterStatus === val ? 'bg-[#f4f4f8] text-[#0d0e17]' : 'text-[#6b6b80] hover:bg-[#f8f8fc]'}`}>
                                {label}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${filterStatus === val ? 'bg-[#e8e8f0] text-[#0d0e17]' : 'bg-[#f4f4f8] text-[#9999b0]'}`}>
                                    {val === 'ALL' ? returns.length : (counts[val] || 0)}
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
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Phiếu Trả</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Đơn gốc</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Khách hàng</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Ngày trả</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Phí trễ</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Tình trạng</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0] text-right">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {loading ? (
                                <tr><td colSpan="7" className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-[#c9a96e]" size={24} /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="7" className="py-16 text-center text-[#9999b0] font-medium text-[13px]">Chưa có dữ liệu trả đồ</td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id} onClick={() => setSelected(r)} className="hover:bg-[#f8f8fc] border-b border-[#f4f4f8] transition-colors cursor-pointer group relative">
                                    <td className="px-5 py-3">
                                        <div className="font-mono font-bold text-[#0d0e17] text-[13px]">#{r.id}</div>
                                    </td>
                                    <td className="px-5 py-3 font-mono font-bold text-[#c9a96e] text-[12px]">#{r.orderId}</td>
                                    <td className="px-5 py-3">
                                        <div className="font-bold text-[#0d0e17]">{r.customerName}</div>
                                        <div className="text-[11px] text-[#9999b0]">{r.customerEmail}</div>
                                    </td>
                                    <td className="px-5 py-3 text-[#6b6b80] font-mono text-[11px]">{formatDate(r.returnDate)}</td>
                                    <td className="px-5 py-3 font-mono font-bold text-amber-600 text-[12px]">
                                        {r.lateFee > 0 ? formatCurrency(r.lateFee) : <span className="text-[#9999b0] font-normal">—</span>}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold ${STATUS_CONFIG[r.status]?.color || ''}`}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CONFIG[r.status]?.dot || '#999' }} />
                                            {STATUS_CONFIG[r.status]?.label || r.status}
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

                <div className="px-6 py-3 border-t border-[#e8e8f0] text-[11px] font-bold text-[#9999b0] bg-white uppercase tracking-wider flex justify-between items-center">
                    <div>Hiển thị <span className="text-[#0d0e17]">{filtered.length}</span> phiếu trả</div>
                </div>
            </div>

            {/* Detail Drawer */}
            {selected && createPortal(
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0b0c17]/60 backdrop-blur-sm p-4 transition-opacity" onClick={() => { setSelected(null); setShowDamageForm(false); }}>
                    <div className="bg-white w-full max-w-[800px] h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-8 py-6 border-b border-[#f4f4f8] shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-[#0d0e17]">Chi tiết Phiếu trả</h2>
                                <p className="text-[13px] font-mono font-bold text-[#c9a96e] mt-0.5">#{selected.id}</p>
                            </div>
                            <button onClick={() => { setSelected(null); setShowDamageForm(false); }} className="p-2.5 bg-[#f4f4f8] hover:bg-[#e8e8f0] rounded-full text-[#6b6b80] transition-colors shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto admin-scroll p-8 bg-[#f8f8fc] space-y-6">
                            {/* Summary Card */}
                            <div className="bg-white rounded-3xl border border-[#e8e8f0] p-6 shadow-sm flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-widest text-[#9999b0] mb-1">Tình trạng</div>
                                    <div className="text-lg font-black text-[#0d0e17]">{STATUS_CONFIG[selected.status]?.label}</div>
                                </div>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${STATUS_CONFIG[selected.status]?.color} bg-opacity-20`}>
                                    <RotateCcw size={28} />
                                </div>
                            </div>

                            {/* Order & Customer */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-3xl border border-[#e8e8f0] p-5 shadow-sm">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#9999b0] mb-2">Đơn gốc</div>
                                    <div className="text-[15px] font-bold text-[#0d0e17]">#{selected.orderId}</div>
                                </div>
                                <div className="bg-white rounded-3xl border border-[#e8e8f0] p-5 shadow-sm">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#9999b0] mb-2">Nhân viên nhận</div>
                                    <div className="text-[15px] font-bold text-[#0d0e17]">{selected.receiverStaffName || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-[#e8e8f0] p-6 shadow-sm">
                                <div className="text-[11px] font-black uppercase tracking-widest text-[#9999b0] mb-4">Thông tin khách hàng</div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3.5 bg-[#f8f8fc] rounded-2xl border border-[#f0f0f5]">
                                        <User size={16} className="text-[#c9a96e]" />
                                        <span className="font-bold text-[#0d0e17]">{selected.customerName}</span>
                                    </div>
                                    <div className="text-[13px] text-[#6b6b80] px-1 italic">{selected.customerEmail}</div>
                                </div>
                            </div>

                            {/* Damage & Fees */}
                            <div className="bg-white rounded-3xl border border-[#e8e8f0] p-6 shadow-sm space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Kiểm tra hư hại ({selected.damages?.length || 0})</div>
                                    <button onClick={() => setShowDamageForm(!showDamageForm)}
                                        className="text-[11px] font-bold text-[#c9a96e] hover:text-[#b08e54] transition-colors">
                                        {showDamageForm ? 'Hủy báo cáo' : '+ Báo cáo hư hỏng'}
                                    </button>
                                </div>

                                {showDamageForm && (
                                    <form onSubmit={handleReportDamage} className="p-5 bg-[#f8f8fc] rounded-2xl border border-[#e8e8f0] space-y-4 admin-fade-in">
                                        <div>
                                            <label className="block text-[11px] font-black uppercase tracking-wider text-[#9999b0] mb-1.5">Sản phẩm lỗi</label>
                                            <select required value={damageForm.productItemId} onChange={e => setDamageForm({...damageForm, productItemId: e.target.value})}
                                                className="w-full px-3 py-2.5 bg-white border border-[#e8e8f0] rounded-xl text-[13px] font-medium outline-none focus:border-[#c9a96e]">
                                                <option value="">-- Chọn sản phẩm khách đã thuê --</option>
                                                {selected.rentedItems?.map(item => (
                                                    <option key={item.productItemId} value={item.productItemId}>
                                                        {item.productName} (SKU: {item.productSku})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-black uppercase tracking-wider text-[#9999b0] mb-1.5">Mô tả tình trạng</label>
                                            <textarea required value={damageForm.description} onChange={e => setDamageForm({...damageForm, description: e.target.value})}
                                                placeholder="VD: Rách gấu váy 5cm, dính rượu vang..." rows={2}
                                                className="w-full px-3 py-2.5 bg-white border border-[#e8e8f0] rounded-xl text-[13px] font-medium outline-none focus:border-[#c9a96e]" />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-[11px] font-black uppercase tracking-wider text-[#9999b0] mb-1.5">Phí phạt (VNĐ)</label>
                                                <input type="number" required min="0" value={damageForm.repairCost} onChange={e => setDamageForm({...damageForm, repairCost: e.target.value})}
                                                    placeholder="0" className="w-full px-3 py-2.5 bg-white border border-[#e8e8f0] rounded-xl text-[13px] font-medium outline-none focus:border-[#c9a96e]" />
                                            </div>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                                            <input type="checkbox" checked={damageForm.chargedToCustomer} onChange={e => setDamageForm({...damageForm, chargedToCustomer: e.target.checked})} 
                                                className="accent-[#c9a96e] w-4 h-4 rounded" />
                                            <span className="text-[12px] font-bold text-[#0d0e17]">Thu tiền khách hàng</span>
                                        </label>
                                        <button type="submit" disabled={submittingDamage}
                                            className="w-full py-2.5 bg-[#0d0e17] text-white rounded-xl text-[13px] font-bold hover:bg-black transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                                            {submittingDamage ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                                            Lưu Báo Cáo
                                        </button>
                                    </form>
                                )}
                                {selected.damages && selected.damages.length > 0 ? (
                                    <div className="space-y-3">
                                        {selected.damages.map((d, idx) => (
                                            <div key={idx} className="p-4 bg-red-50 rounded-2xl border border-red-100 flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[11px] font-black text-red-700 uppercase tracking-tight">SKU: {d.productSku}</span>
                                                    <span className="text-[13px] font-black text-red-700">{formatCurrency(d.repairCost)}</span>
                                                </div>
                                                <p className="text-[12px] text-red-600 font-medium italic">"{d.description}"</p>
                                                {d.chargedToCustomer && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-white/50 w-fit px-2 py-0.5 rounded">
                                                        <ShieldAlert size={10} /> Đã tính phí cho khách
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-emerald-50 rounded-3xl border border-emerald-100">
                                        <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                                        <p className="text-emerald-700 font-bold text-[13px]">Sản phẩm còn nguyên vẹn</p>
                                    </div>
                                )}
                            </div>

                            {/* Total Fee Section */}
                            <div className="bg-[#0d0e17] rounded-3xl p-6 text-white shadow-xl shadow-black/20">
                                <div className="flex justify-between text-[13px] opacity-60 mb-2">
                                    <span>Phí trễ hạn:</span>
                                    <span>{formatCurrency(selected.lateFee)}</span>
                                </div>
                                <div className="flex justify-between text-[13px] opacity-60 mb-4">
                                    <span>Phí hư hại:</span>
                                    <span>{formatCurrency(selected.damages?.reduce((acc, d) => acc + (d.chargedToCustomer ? d.repairCost : 0), 0))}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <span className="text-[15px] font-bold">Tổng phí phát sinh:</span>
                                    <span className="text-2xl font-black text-[#c9a96e]">{formatCurrency(selected.lateFee + selected.damages?.reduce((acc, d) => acc + (d.chargedToCustomer ? d.repairCost : 0), 0))}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-[#f4f4f8] bg-white shrink-0">
                            <button onClick={() => { setSelected(null); setShowDamageForm(false); }}
                                className="w-full px-6 py-3.5 bg-[#f4f4f8] hover:bg-[#e8e8f0] text-[#0d0e17] rounded-2xl font-bold transition-all text-[13px]">
                                Đóng chi tiết
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ManageReturns;
