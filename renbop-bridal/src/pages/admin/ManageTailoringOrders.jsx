import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../../utils/apiClient';
import { useToast } from '../../context/ToastContext';
import {
    Loader2, RefreshCw, Scissors, ChevronDown, X,
    Calendar, CheckCircle2, Package, Search, Plus
} from 'lucide-react';

/* ─── Status Config (16-Week Cycle) ─────────────────────────────── */
const STATUS_FLOW = ['MEASURED', 'CUTTING', 'SEWING', 'FITTING', 'DONE'];

const STATUS_CONFIG = {
    MEASURED: { label: 'Khởi tạo & Lấy số đo', week: 'Tuần 1-2', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: '#3b82f6', bar: '#3b82f6', desc: 'Chốt thiết kế, lấy số đo chuẩn.' },
    CUTTING:  { label: 'Chuẩn bị vải & Cắt rập', week: 'Tuần 3-6', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: '#f59e0b', bar: '#f59e0b', desc: 'Nhập lụa/ren, cắt rập 3D.' },
    SEWING:   { label: 'Khâu nháp & Dựng phom', week: 'Tuần 7-10', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: '#a855f7', bar: '#a855f7', desc: 'Lên dáng váy cơ bản (Muslin).' },
    FITTING:  { label: 'Thử phom & Đính kết', week: 'Tuần 11-14', color: 'bg-orange-50 text-orange-700 border-orange-200', dot: '#f97316', bar: '#f97316', desc: 'Cô dâu thử váy lần 1, đính hạt/ren.' },
    DONE:     { label: 'Hoàn thiện & Bàn giao', week: 'Tuần 15-16', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: '#10b981', bar: '#10b981', desc: 'Thử lần cuối, đóng gói cao cấp.' },
};

/* ─── StatusPill ─────────────────────────────────────────────────── */
const StatusPill = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || {};
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wide ${cfg.color}`}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.dot }} />
            {cfg.label || status}
        </span>
    );
};

/* ─── StatusBar (16-Week Production Stepper) ─────────────────────── */
const StatusBar = ({ status }) => {
    const idx = STATUS_FLOW.indexOf(status);
    return (
        <div className="flex items-start gap-0 relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#f4f4f8] -z-10 rounded-full" />
            {STATUS_FLOW.map((s, i) => {
                const done    = i <= idx;
                const current = i === idx;
                const cfg     = STATUS_CONFIG[s];
                return (
                    <React.Fragment key={s}>
                        <div className="flex-1 flex flex-col items-center group relative">
                            {/* Connector Line Fill */}
                            {i > 0 && (
                                <div className="absolute top-4 left-0 w-1/2 h-0.5 -z-10 transition-all duration-500" 
                                    style={{ background: done ? cfg.bar : 'transparent', transform: 'translateX(-100%)' }} />
                            )}
                            {i < STATUS_FLOW.length - 1 && (
                                <div className="absolute top-4 right-0 w-1/2 h-0.5 -z-10 transition-all duration-500" 
                                    style={{ background: i < idx ? cfg.bar : 'transparent' }} />
                            )}
                            
                            {/* Node */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all z-10 text-[10px] font-black ${
                                done ? 'border-white text-white shadow-md' : 'border-white text-[#9999b0] bg-[#f4f4f8]'
                            }`} style={done ? { background: cfg.bar, boxShadow: current ? `0 0 0 4px ${cfg.bar}33` : '0 2px 4px rgba(0,0,0,0.1)' } : {}}>
                                {done ? (current ? <Scissors size={14} className="animate-bounce-subtle" /> : <CheckCircle2 size={14} />) : <span>{i + 1}</span>}
                            </div>
                            
                            {/* Labels */}
                            <div className="mt-3 text-center px-1">
                                <span className={`block text-[10px] font-black uppercase tracking-wider mb-0.5 transition-colors ${current ? 'text-[#0d0e17]' : 'text-[#9999b0]'}`}>
                                    {cfg.label}
                                </span>
                                <span className={`block text-[9px] font-bold uppercase transition-colors ${current ? 'text-[#c9a96e]' : 'text-[#c8c8d8]'}`}>
                                    {cfg.week}
                                </span>
                            </div>
                            
                            {/* Hover Tooltip for CRM Context */}
                            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#0d0e17] text-white text-[10px] font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-20">
                                {cfg.desc}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0d0e17] rotate-45" />
                            </div>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

/* ─── Main Component ─────────────────────────────────────────────── */
const ManageTailoringOrders = () => {
    const [orders, setOrders]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const { showToast }             = useToast();
    const [selected, setSelected]   = useState(null);
    const [updating, setUpdating]   = useState(null);
    const [filterStatus, setFilter] = useState('ALL');
    const [search, setSearch]       = useState('');
    const [viewMode, setViewMode]   = useState('KANBAN'); // 'TABLE' | 'KANBAN'
    const [draggedOrder, setDraggedOrder] = useState(null);

    // Internal note state
    const [noteText, setNoteText]   = useState('');
    const [savingNote, setSavingNote] = useState(false);
    // Deadline edit
    const [deadlineEdit, setDeadlineEdit] = useState(false);
    const [deadlineVal, setDeadlineVal]   = useState('');
    const [savingDeadline, setSavingDeadline] = useState(false);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await apiClient('/tailoring-orders');
            if (res.success) setOrders(res.data || []);
        } catch (err) {
            showToast('❌ Không thể tải danh sách may đo');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdating(id);
        try {
            const res = await apiClient(`/tailoring-orders/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.success) {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
                if (selected?.id === id) setSelected(s => ({ ...s, status: newStatus }));
                showToast(`✅ Cập nhật → ${STATUS_CONFIG[newStatus]?.label}`);
            }
        } catch (err) {
            showToast(`❌ Lỗi: ${err.message}`);
        } finally {
            setUpdating(null);
        }
    };

    const handleSaveNote = async () => {
        if (!selected) return;
        setSavingNote(true);
        try {
            const res = await apiClient(`/tailoring-orders/${selected.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: selected.status, internalNote: noteText })
            });
            if (res.success) {
                const updated = { ...selected, internalNote: noteText };
                setOrders(prev => prev.map(o => o.id === selected.id ? updated : o));
                setSelected(updated);
                showToast('✅ Đã lưu ghi chú nội bộ');
            }
        } catch (err) { showToast(`❌ Lỗi: ${err.message}`); }
        finally { setSavingNote(false); }
    };

    const handleSaveDeadline = async () => {
        if (!selected || !deadlineVal) return;
        setSavingDeadline(true);
        try {
            const res = await apiClient(`/tailoring-orders/${selected.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: selected.status, estimatedCompletionDate: new Date(deadlineVal).toISOString() })
            });
            if (res.success) {
                const updated = { ...selected, estimatedCompletionDate: deadlineVal };
                setOrders(prev => prev.map(o => o.id === selected.id ? updated : o));
                setSelected(updated);
                setDeadlineEdit(false);
                showToast('✅ Đã cập nhật ngày dự kiến');
            }
        } catch (err) { showToast(`❌ Lỗi: ${err.message}`); }
        finally { setSavingDeadline(false); }
    };

    const filtered = useMemo(() => orders
        .filter(o => filterStatus === 'ALL' || o.status === filterStatus)
        .filter(o => !search || [o.customerName, o.productName, o.productSku, String(o.id), String(o.orderId)]
            .some(v => v?.toLowerCase().includes(search.toLowerCase()))), [orders, filterStatus, search]);

    const stats = useMemo(() => {
        const s = {};
        STATUS_FLOW.forEach(k => { s[k] = orders.filter(o => o.status === k).length; });
        return s;
    }, [orders]);

    return (
        <div className="w-full h-full flex flex-col p-6 space-y-4 font-sans bg-[#f4f4f8]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#0d0e17]">Quản lý May Đo</h1>
                    <p className="text-[12px] font-medium text-[#6b6b80] mt-0.5">
                        {orders.length} phiếu · <span className="text-emerald-600 font-bold">{stats['DONE'] || 0} hoàn thành</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-[#f8f8fc] p-1 rounded-xl border border-[#e8e8f0]">
                        <button onClick={() => setViewMode('TABLE')} className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${viewMode === 'TABLE' ? 'bg-white shadow-sm text-[#0d0e17]' : 'text-[#9999b0] hover:text-[#0d0e17]'}`}>Bảng</button>
                        <button onClick={() => setViewMode('KANBAN')} className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${viewMode === 'KANBAN' ? 'bg-white shadow-sm text-[#0d0e17]' : 'text-[#9999b0] hover:text-[#0d0e17]'}`}>Kanban</button>
                    </div>
                    <button onClick={fetchAll} className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e8e8f0] rounded-xl text-[12px] font-bold hover:bg-[#f8f8fc] transition-all shadow-sm">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-1.5 bg-[#0d0e17] hover:bg-black text-white px-4 py-2 rounded-xl text-[12px] font-bold transition-all shadow-sm">
                        <Plus size={14} /> Tạo Mới
                    </button>
                </div>
            </div>

            {/* Kanban / Table Container */}
            <div className={`flex-1 flex flex-col ${viewMode === 'TABLE' ? 'bg-white rounded-2xl border border-[#e8e8f0] shadow-sm overflow-hidden' : 'overflow-hidden'}`}>
                {/* Advanced Filter Toolbar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f4f4f8] bg-white">
                    <div className="relative flex-[2] max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9999b0]" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm cô dâu, sản phẩm, mã phiếu..."
                            className="w-full pl-8 pr-3 py-1.5 bg-[#f8f8fc] border border-transparent rounded-lg text-[13px] outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                    </div>
                    <div className="h-5 w-px bg-[#e8e8f0]" />
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {['ALL', ...STATUS_FLOW].map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${filterStatus === s ? 'bg-[#f4f4f8] text-[#0d0e17]' : 'text-[#6b6b80] hover:bg-[#f8f8fc]'}`}>
                                {s === 'ALL' ? 'Tất cả' : STATUS_CONFIG[s].label}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${filterStatus === s ? 'bg-[#e8e8f0] text-[#0d0e17]' : 'bg-[#f4f4f8] text-[#9999b0]'}`}>
                                    {s === 'ALL' ? orders.length : (stats[s] || 0)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data View */}
                {viewMode === 'TABLE' && (
                    <div className="flex-1 overflow-auto admin-scroll bg-[#f8f8fc]">
                    <table className="w-full text-left text-[13px] border-collapse">
                        <thead className="bg-white sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">ID</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Cô Dâu</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Sản Phẩm</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Tiến Độ</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Trạng Thái</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Ngày Hẹn</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0] text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {loading ? (
                                <tr><td colSpan="7" className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-[#c9a96e]" size={24} /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="7" className="py-16 text-center text-[#9999b0] font-medium text-[13px]">Không có phiếu may đo nào.</td></tr>
                            ) : filtered.map(o => {
                                const idx = STATUS_FLOW.indexOf(o.status);
                                const progress = Math.round(((idx + 1) / STATUS_FLOW.length) * 100);
                                const cfg = STATUS_CONFIG[o.status] || {};
                                return (
                                    <tr key={o.id} className="hover:bg-[#f8f8fc] border-b border-[#f4f4f8] transition-colors group relative">
                                        <td className="px-5 py-3" onClick={() => setSelected(o)}>
                                            <span className="font-mono font-bold text-[#0d0e17] text-[13px] cursor-pointer group-hover:text-[#c9a96e] transition-colors">#{o.id}</span>
                                            {o.orderId && <div className="text-[10px] font-mono font-bold text-[#9999b0] mt-0.5">Đơn #{o.orderId}</div>}
                                        </td>
                                        <td className="px-5 py-3" onClick={() => setSelected(o)}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0 shadow-sm"
                                                    style={{ background: 'linear-gradient(135deg, #c9a96e, #e2c08a)' }}>
                                                    {(o.customerName || '?')[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#0d0e17] text-[13px] cursor-pointer">{o.customerName || 'N/A'}</div>
                                                    <div className="text-[11px] text-[#9999b0]">{o.customerEmail || '—'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3" onClick={() => setSelected(o)}>
                                            <div className="font-bold text-[#0d0e17] cursor-pointer">{o.productName || '(May đo mới)'}</div>
                                            {o.productSku && <div className="text-[11px] font-mono text-[#9999b0]">SKU: {o.productSku}</div>}
                                        </td>
                                        <td className="px-5 py-3" onClick={() => setSelected(o)}>
                                            <div className="w-32 cursor-pointer">
                                                <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                                    <span className="text-[#9999b0]">Tiến độ</span>
                                                    <span style={{ color: cfg.bar }}>{progress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-[#f4f4f8] rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: cfg.bar }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3" onClick={() => setSelected(o)}>
                                            <div className="cursor-pointer">
                                                <StatusPill status={o.status} />
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 font-mono text-[#6b6b80] text-[11px]" onClick={() => setSelected(o)}>
                                            {o.expectedCompletionDate
                                                ? new Date(o.expectedCompletionDate).toLocaleDateString('vi-VN')
                                                : <span className="text-[#9999b0]">—</span>}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-2">
                                                {updating === o.id ? (
                                                    <Loader2 className="animate-spin text-[#c9a96e]" size={16} />
                                                ) : (
                                                    <div className="relative inline-block">
                                                        <select value={o.status} onChange={e => handleStatusUpdate(o.id, e.target.value)}
                                                            className="appearance-none bg-[#f4f4f8] border border-[#e8e8f0] rounded-md text-[11px] font-bold px-2 py-1 pr-6 outline-none focus:border-[#c9a96e] cursor-pointer hover:bg-[#e8e8f0] transition-colors text-[#0d0e17]">
                                                            {STATUS_FLOW.map(s => (
                                                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b6b80] pointer-events-none" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                )}
                
                {viewMode === 'KANBAN' && (
                    <div className="flex-1 overflow-x-auto admin-scroll flex gap-5 pb-2">
                        {STATUS_FLOW.map(status => {
                            const columnOrders = filtered.filter(o => o.status === status);
                            const cfg = STATUS_CONFIG[status];
                            
                            return (
                                <div key={status} className="w-[300px] shrink-0 flex flex-col max-h-full"
                                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        if (draggedOrder && draggedOrder.status !== status) {
                                            handleStatusUpdate(draggedOrder.id, status);
                                        }
                                        setDraggedOrder(null);
                                    }}>
                                    
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.dot }} />
                                            <h3 className="font-black text-[13px] text-[#0d0e17] uppercase tracking-wide">{cfg.label}</h3>
                                        </div>
                                        <span className="bg-white border border-[#e8e8f0] text-[#6b6b80] text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                                            {columnOrders.length}
                                        </span>
                                    </div>
                                    
                                    <div className={`flex-1 overflow-y-auto admin-scroll p-1.5 space-y-3 rounded-2xl border-2 transition-colors ${
                                        draggedOrder && draggedOrder.status !== status ? 'border-dashed border-[#c9a96e]/40 bg-[#c9a96e]/5' : 'border-transparent'
                                    }`}>
                                        {columnOrders.map(o => (
                                            <div key={o.id} draggable onClick={() => setSelected(o)}
                                                onDragStart={(e) => {
                                                    setDraggedOrder(o);
                                                    e.dataTransfer.setData('text/plain', o.id);
                                                    e.currentTarget.style.opacity = '0.4';
                                                }}
                                                onDragEnd={(e) => {
                                                    setDraggedOrder(null);
                                                    e.currentTarget.style.opacity = '1';
                                                }}
                                                className="bg-white p-4 rounded-2xl border border-[#e8e8f0] shadow-sm hover:shadow-md hover:border-[#c9a96e] transition-all cursor-grab active:cursor-grabbing group">
                                                
                                                <div className="flex items-start justify-between mb-3">
                                                    <span className="text-[10px] font-black text-[#c9a96e] bg-[#c9a96e]/10 px-2 py-1 rounded-md tracking-wider">#{o.id}</span>
                                                    {updating === o.id && <Loader2 className="animate-spin text-[#c9a96e]" size={14} />}
                                                </div>
                                                
                                                <div className="font-black text-[#0d0e17] text-[14px] mb-1">{o.customerName || 'N/A'}</div>
                                                <div className="text-[12px] font-medium text-[#6b6b80] mb-3 line-clamp-1">{o.productName || '(May đo mới)'}</div>
                                                
                                                <div className="flex items-center justify-between pt-3 border-t border-[#f4f4f8]">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#9999b0]">
                                                        <Calendar size={12} />
                                                        {o.expectedCompletionDate ? new Date(o.expectedCompletionDate).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'}) : 'Chưa hẹn'}
                                                    </div>
                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white uppercase bg-gradient-to-br from-[#c9a96e] to-[#e2c08a]">
                                                        {(o.customerName || '?')[0]}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {columnOrders.length === 0 && (
                                            <div className="h-24 rounded-2xl border-2 border-dashed border-[#e8e8f0] flex items-center justify-center text-[12px] font-medium text-[#c0c0d0]">
                                                Kéo thả vào đây
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selected && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0c17]/60 backdrop-blur-sm p-4 transition-opacity" onClick={() => setSelected(null)}>
                    <div className="bg-white w-full max-w-[800px] h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-7 py-6 border-b border-[#f4f4f8]">
                            <div>
                                <h2 className="text-xl font-bold text-[#0d0e17]">
                                    Phiếu May Đo <span className="text-[#c9a96e] font-mono">#{selected.id}</span>
                                </h2>
                                {selected.orderId && <p className="text-[13px] text-[#9999b0] font-medium mt-0.5">Đơn hàng #{selected.orderId}</p>}
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2 bg-[#f4f4f8] hover:bg-[#e8e8f0] rounded-full text-[#6b6b80] hover:text-[#0d0e17] transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto admin-scroll bg-[#f8f8fc] p-7 space-y-6">
                            {/* Status Bar */}
                            <div className="bg-white p-5 rounded-2xl border border-[#e8e8f0] shadow-sm">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9999b0] mb-5">Tiến Trình May</h3>
                                <StatusBar status={selected.status} />
                            </div>

                            {/* Info */}
                            <div className="bg-white p-6 rounded-2xl border border-[#e8e8f0] shadow-sm">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9999b0] mb-4 pb-2 border-b border-[#f4f4f8]">Thông Tin</h3>
                                <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-[13px]">
                                    <div><span className="text-[#9999b0] block text-[10px] font-bold uppercase mb-1">Cô Dâu</span><div className="font-bold text-[#0d0e17]">{selected.customerName || 'N/A'}</div></div>
                                    <div><span className="text-[#9999b0] block text-[10px] font-bold uppercase mb-1">Trạng Thái</span><div><StatusPill status={selected.status} /></div></div>
                                    <div><span className="text-[#9999b0] block text-[10px] font-bold uppercase mb-1">Sản Phẩm</span><div className="font-bold text-[#0d0e17]">{selected.productName || '(May đo mới)'}</div></div>
                                    <div><span className="text-[#9999b0] block text-[10px] font-bold uppercase mb-1">SKU</span><div className="font-mono font-bold text-[#6b6b80]">{selected.productSku || '—'}</div></div>
                                    <div className="col-span-2"><span className="text-[#9999b0] block text-[10px] font-bold uppercase mb-1">Ngày Hẹn Giao</span>
                                        <div className="font-bold text-[#0d0e17]">
                                            {selected.expectedCompletionDate ? new Date(selected.expectedCompletionDate).toLocaleDateString('vi-VN') : '—'}
                                        </div>
                                    </div>
                                    {selected.notes && (
                                        <div className="col-span-2"><span className="text-[#9999b0] block text-[10px] font-bold uppercase mb-1">Ghi Chú</span>
                                            <div className="bg-[#f8f8fc] rounded-xl p-3 text-[13px] font-medium text-[#6b6b80] border border-[#e8e8f0]">{selected.notes}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Measurements */}
                            {(selected.customerMeasurements || []).length > 0 && (
                                <div className="bg-white p-6 rounded-2xl border border-[#e8e8f0] shadow-sm">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9999b0] mb-4 pb-2 border-b border-[#f4f4f8]">Số Đo Cô Dâu (Bản ghi mới nhất)</h3>
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        {[
                                            { label: 'V1 (Ngực)', value: selected.customerMeasurements[0].bust },
                                            { label: 'V2 (Eo)', value: selected.customerMeasurements[0].waist },
                                            { label: 'V3 (Mông)', value: selected.customerMeasurements[0].hip },
                                            { label: 'Vai', value: selected.customerMeasurements[0].shoulder },
                                            { label: 'Tay', value: selected.customerMeasurements[0].armLength }
                                        ].map(m => (
                                            <div key={m.label} className="bg-[#f8f8fc] rounded-xl p-3 border border-[#e8e8f0]">
                                                <div className="text-[10px] font-bold text-[#9999b0] uppercase mb-1">{m.label}</div>
                                                <div className="text-[14px] font-black text-[#0d0e17]">{m.value ? `${m.value} cm` : '--'}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {selected.customerMeasurements[0].note && (
                                        <div className="mt-3 p-3 bg-[#fff9eb] border border-[#fff2d1] rounded-xl text-[12px] text-[#856404] italic">
                                            Lưu ý: {selected.customerMeasurements[0].note}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Update Status */}
                            <div className="bg-white p-6 rounded-2xl border border-[#e8e8f0] shadow-sm">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9999b0] mb-4 pb-2 border-b border-[#f4f4f8]">Cập Nhật Tiến Độ</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {STATUS_FLOW.map(s => {
                                        const active = selected.status === s;
                                        const allowed = selected.allowedNextStatuses?.includes(s);
                                        const cfg = STATUS_CONFIG[s];
                                        return (
                                            <button key={s} disabled={active || updating === selected.id || (!active && !allowed)}
                                                onClick={() => handleStatusUpdate(selected.id, s)}
                                                className={`px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all border ${
                                                    active ? `${cfg.color} cursor-default` : 
                                                    allowed ? 'bg-[#f8f8fc] text-[#0d0e17] border-[#e8e8f0] hover:border-[#c9a96e] hover:bg-white' : 
                                                    'bg-[#f4f4f8] text-[#c0c0d0] border-transparent cursor-not-allowed opacity-50'
                                                }`}>
                                                {active && <span className="mr-1">✓</span>}
                                                {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Fitting Sessions */}
                            <div className="bg-white p-6 rounded-2xl border border-[#e8e8f0] shadow-sm">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9999b0] mb-4 pb-2 border-b border-[#f4f4f8]">
                                    Lịch Thử Đồ ({selected.fittingSessions?.length || 0})
                                </h3>
                                {(selected.fittingSessions || []).length === 0 ? (
                                    <div className="flex items-center gap-3 py-4 px-3 bg-[#f8f8fc] rounded-xl border border-dashed border-[#d0d0d0]">
                                        <Calendar size={20} className="text-[#9999b0]" />
                                        <span className="text-[13px] text-[#9999b0] font-medium">Chưa có lịch thử đồ</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selected.fittingSessions.map(fs => (
                                            <div key={fs.id} className="bg-[#f8f8fc] rounded-xl p-4 border border-[#e8e8f0] text-[13px]">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-[#0d0e17]">{fs.fittingDate ? new Date(fs.fittingDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${
                                                        fs.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        fs.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>{fs.status === 'SCHEDULED' ? 'Đã Lịch' : fs.status === 'COMPLETED' ? 'Hoàn Thành' : 'Đã Hủy'}</span>
                                                </div>
                                                <div className="text-[12px] text-[#9999b0]">NV: {fs.staffName || '(Chưa gán)'}</div>
                                                {fs.notes && <div className="text-[12px] text-[#6b6b80] mt-1 bg-white px-2 py-1 rounded-lg">{fs.notes}</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Internal Note */}
                            <div className="bg-white p-6 rounded-2xl border border-[#e8e8f0] shadow-sm">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9999b0] mb-3 pb-2 border-b border-[#f4f4f8]">
                                    Ghi chú Nội bộ
                                </h3>
                                <textarea rows="3"
                                    value={noteText}
                                    onChange={e => setNoteText(e.target.value)}
                                    placeholder="Ghi chú dành cho nhân viên nội bộ..."
                                    className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[12px] text-[#0d0e17] outline-none focus:border-[#c9a96e] focus:bg-white transition-all resize-none mb-3"
                                />
                                <button onClick={handleSaveNote} disabled={savingNote}
                                    className="w-full py-2 text-[12px] font-black bg-[#0d0e17] text-white rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                    {savingNote && <Loader2 size={13} className="animate-spin" />}
                                    Lưu ghi chú
                                </button>
                                {selected.internalNote && (
                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-800 font-medium italic">
                                        Hiện tại: "{selected.internalNote}"
                                    </div>
                                )}
                            </div>

                            {/* Deadline */}
                            <div className="bg-white p-6 rounded-2xl border border-[#e8e8f0] shadow-sm">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9999b0] mb-3 pb-2 border-b border-[#f4f4f8]">
                                    Ngày Dự Kiến Hoàn Thành
                                </h3>
                                {deadlineEdit ? (
                                    <div className="flex gap-2">
                                        <input type="date" value={deadlineVal} onChange={e => setDeadlineVal(e.target.value)}
                                            className="flex-1 bg-[#f8f8fc] border border-[#c9a96e] rounded-xl p-2.5 text-[12px] outline-none" />
                                        <button onClick={handleSaveDeadline} disabled={savingDeadline}
                                            className="px-4 py-2 bg-[#0d0e17] text-white rounded-xl text-[12px] font-bold hover:bg-black transition-all disabled:opacity-60">
                                            {savingDeadline ? <Loader2 size={13} className="animate-spin" /> : 'Lưu'}
                                        </button>
                                        <button onClick={() => setDeadlineEdit(false)}
                                            className="px-3 py-2 bg-[#f4f4f8] rounded-xl text-[12px] font-bold hover:bg-[#e8e8f0] transition-colors">Hủy</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] font-bold text-[#0d0e17]">
                                            {selected.estimatedCompletionDate
                                                ? new Date(selected.estimatedCompletionDate).toLocaleDateString('vi-VN')
                                                : <span className="text-[#9999b0] font-medium">Chưa đặt ngày</span>}
                                        </span>
                                        <button onClick={() => { setDeadlineEdit(true); setDeadlineVal(selected.estimatedCompletionDate?.slice(0,10) || ''); }}
                                            className="text-[11px] font-bold px-3 py-1.5 bg-[#f4f4f8] hover:bg-[#c9a96e]/10 hover:text-[#c9a96e] rounded-lg transition-colors">
                                            ✏️ Sửa ngày
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ManageTailoringOrders;
