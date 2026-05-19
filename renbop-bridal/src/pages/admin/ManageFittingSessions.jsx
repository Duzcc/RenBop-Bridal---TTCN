import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../../utils/apiClient';
import { useToast } from '../../context/ToastContext';
import {
    Loader2, RefreshCw, Calendar, Search, X,
    Plus, CheckCircle2, Clock, Ban, ChevronDown, Trash2, Video, Link as LinkIcon
} from 'lucide-react';

/* ─── Config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
    SCHEDULED: { label: 'Đã Lịch',     color: 'bg-blue-50   text-blue-700   border-blue-200',    dot: '#3b82f6' },
    COMPLETED: { label: 'Hoàn Thành',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: '#10b981' },
    CANCELLED: { label: 'Đã Hủy',      color: 'bg-red-50    text-red-700    border-red-200',      dot: '#ef4444' },
};

const FORM_INIT = { fittingDate: '', notes: '', status: 'SCHEDULED', isVirtual: false, meetingLink: '' };
const EDIT_FORM_INIT = { fittingDate: '', notes: '', status: 'SCHEDULED', isVirtual: false, meetingLink: '' };

const parseNotes = (rawNotes) => {
    if (!rawNotes) return { isVirtual: false, meetingLink: '', notes: '' };
    const match = rawNotes.match(/^\[VIRTUAL\] Link: (.*?) \| ([\s\S]*)$/);
    if (match) {
        return { isVirtual: true, meetingLink: match[1].trim(), notes: match[2] };
    }
    const matchNoNote = rawNotes.match(/^\[VIRTUAL\] Link: (.*?)$/);
    if (matchNoNote) {
        return { isVirtual: true, meetingLink: matchNoNote[1].trim(), notes: '' };
    }
    return { isVirtual: false, meetingLink: '', notes: rawNotes };
};

const buildNotes = (isVirtual, meetingLink, notes) => {
    if (isVirtual) {
        if (notes) return `[VIRTUAL] Link: ${meetingLink} | ${notes}`;
        return `[VIRTUAL] Link: ${meetingLink}`;
    }
    return notes;
};

/* ─── Confirm Dialog ─────────────────────────────────────────────── */
const ConfirmDialog = ({ message, onConfirm, onCancel }) => createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0b0c17]/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
            <p className="text-[14px] font-bold text-[#0d0e17] mb-5 leading-snug">{message}</p>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-2.5 bg-[#f4f4f8] rounded-xl font-bold text-[13px] hover:bg-[#e8e8f0] transition-colors">Hủy</button>
                <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-[13px] hover:bg-red-600 transition-colors">Xác nhận</button>
            </div>
        </div>
    </div>,
    document.body
);

/* ─── Main Component ─────────────────────────────────────────────── */
const ManageFittingSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading]   = useState(true);
    const { showToast }           = useToast();
    const [selected, setSelected] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [filterStatus, setFilter] = useState('ALL');
    const [search, setSearch]     = useState('');

    const [scheduleModal, setScheduleModal] = useState(null);
    const [form, setForm]         = useState(FORM_INIT);
    const [isSaving, setIsSaving] = useState(false);

    // Edit modal
    const [editModal, setEditModal]   = useState(null); // session to edit
    const [editForm, setEditForm]     = useState(EDIT_FORM_INIT);
    const [isEditSaving, setEditSaving] = useState(false);

    // Confirm dialog
    const [confirmData, setConfirmData] = useState(null); // { message, onConfirm }

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await apiClient('/fitting-sessions');
            if (res.success) setSessions(res.data || []);
        } catch {
            showToast('❌ Không thể tải danh sách lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (sessionId, newStatus) => {
        setUpdating(sessionId);
        try {
            const target = sessions.find(s => s.id === sessionId);
            if (!target) return;
            const payload = { fittingDate: target.fittingDate, notes: target.notes, status: newStatus };
            const res = await apiClient(`/fitting-sessions/${sessionId}`, { method: 'PUT', body: JSON.stringify(payload) });
            if (res.success) {
                setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: newStatus } : s));
                if (selected?.id === sessionId) setSelected(s => ({ ...s, status: newStatus }));
                showToast(`✅ Cập nhật → ${STATUS_CONFIG[newStatus]?.label}`);
            }
        } catch (err) {
            showToast(`❌ Lỗi: ${err.message}`);
        } finally {
            setUpdating(null);
        }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        if (!scheduleModal) return;
        setIsSaving(true);
        try {
            const finalNotes = buildNotes(form.isVirtual, form.meetingLink, form.notes);
            const payload = { fittingDate: new Date(form.fittingDate).toISOString(), notes: finalNotes, status: form.status };
            const res = await apiClient(`/fitting-sessions/tailoring-order/${scheduleModal}`, { method: 'POST', body: JSON.stringify(payload) });
            if (res.success) {
                showToast('✅ Tạo lịch hẹn thành công');
                setScheduleModal(null);
                setForm(FORM_INIT);
                fetchAll();
            }
        } catch (err) {
            showToast(`❌ Lỗi: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setConfirmData({
            message: 'Bạn có chắc muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.',
            onConfirm: async () => {
                setConfirmData(null);
                try {
                    const res = await apiClient(`/fitting-sessions/${id}`, { method: 'DELETE' });
                    if (res.success) {
                        setSessions(prev => prev.filter(s => s.id !== id));
                        if (selected?.id === id) setSelected(null);
                        showToast('✅ Đã hủy lịch hẹn');
                    }
                } catch (err) { showToast(`❌ Lỗi: ${err.message}`); }
            }
        });
    };

    const openEditModal = (session) => {
        const localDate = session.fittingDate
            ? new Date(session.fittingDate).toISOString().slice(0, 16)
            : '';
        const parsed = parseNotes(session.notes);
        setEditForm({ fittingDate: localDate, notes: parsed.notes, status: session.status, isVirtual: parsed.isVirtual, meetingLink: parsed.meetingLink });
        setEditModal(session);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditSaving(true);
        try {
            const finalNotes = buildNotes(editForm.isVirtual, editForm.meetingLink, editForm.notes);
            const payload = { fittingDate: new Date(editForm.fittingDate).toISOString(), notes: finalNotes, status: editForm.status };
            const res = await apiClient(`/fitting-sessions/${editModal.id}`, { method: 'PUT', body: JSON.stringify(payload) });
            if (res.success) {
                const updated = { ...editModal, ...payload, fittingDate: payload.fittingDate };
                setSessions(prev => prev.map(s => s.id === editModal.id ? updated : s));
                if (selected?.id === editModal.id) setSelected(updated);
                showToast('✅ Cập nhật lịch hẹn thành công');
                setEditModal(null);
            }
        } catch (err) { showToast(`❌ Lỗi: ${err.message}`); }
        finally { setEditSaving(false); }
    };

    const filtered = useMemo(() => sessions
        .filter(s => filterStatus === 'ALL' || s.status === filterStatus)
        .filter(s => !search || [s.customerName, s.productName, s.staffName, String(s.id)]
            .some(v => v?.toLowerCase().includes(search.toLowerCase())))
        .sort((a, b) => new Date(b.fittingDate || 0) - new Date(a.fittingDate || 0)),
        [sessions, filterStatus, search]);

    const counts = useMemo(() => {
        const c = {};
        Object.keys(STATUS_CONFIG).forEach(k => { c[k] = sessions.filter(s => s.status === k).length; });
        return c;
    }, [sessions]);

    const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <div className="w-full h-full flex flex-col p-6 space-y-4 font-sans bg-[#f4f4f8]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#0d0e17]">Lịch Thử Đồ & Tư Vấn</h1>
                    <p className="text-[12px] font-medium text-[#6b6b80] mt-0.5">
                        {sessions.length} lịch hẹn · <span className="text-blue-600 font-bold">{counts['SCHEDULED'] || 0} sắp tới</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchAll} className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e8e8f0] rounded-xl text-[12px] font-bold hover:bg-[#f8f8fc] transition-all shadow-sm">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => { setScheduleModal(-1); setForm(FORM_INIT); }}
                        className="flex items-center gap-1.5 bg-[#0d0e17] hover:bg-black text-white px-4 py-2 rounded-xl text-[12px] font-bold transition-all shadow-sm">
                        <Plus size={14} /> Tạo Lịch Hẹn
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <div key={key} className="bg-white rounded-xl border border-[#e8e8f0] shadow-sm p-4 flex items-center gap-3 hover:-translate-y-1 transition-transform cursor-pointer"
                        onClick={() => setFilter(filterStatus === key ? 'ALL' : key)}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${cfg.dot}15` }}>
                            {key === 'SCHEDULED' ? <Clock size={16} style={{ color: cfg.dot }} /> :
                             key === 'COMPLETED' ? <CheckCircle2 size={16} style={{ color: cfg.dot }} /> :
                             <Ban size={16} style={{ color: cfg.dot }} />}
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#9999b0] mb-0.5">{cfg.label}</div>
                            <div className="text-xl font-black text-[#0d0e17] leading-none">{counts[key] || 0}</div>
                        </div>
                        {filterStatus === key && <div className="ml-auto w-2 h-2 rounded-full" style={{ background: cfg.dot }} />}
                    </div>
                ))}
            </div>

            {/* Main Seamless Table Container */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#e8e8f0] shadow-sm overflow-hidden">
                {/* Advanced Filter Toolbar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f4f4f8] bg-white">
                    <div className="relative flex-[2] max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9999b0]" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm cô dâu, nhân viên..."
                            className="w-full pl-8 pr-3 py-1.5 bg-[#f8f8fc] border border-transparent rounded-lg text-[13px] outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                    </div>
                    <div className="h-5 w-px bg-[#e8e8f0]" />
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {['ALL', ...Object.keys(STATUS_CONFIG)].map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${filterStatus === s ? 'bg-[#f4f4f8] text-[#0d0e17]' : 'text-[#6b6b80] hover:bg-[#f8f8fc]'}`}>
                                {s === 'ALL' ? 'Tất cả' : STATUS_CONFIG[s].label}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${filterStatus === s ? 'bg-[#e8e8f0] text-[#0d0e17]' : 'bg-[#f4f4f8] text-[#9999b0]'}`}>
                                    {s === 'ALL' ? sessions.length : (counts[s] || 0)}
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
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">ID</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Cô Dâu</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Sản Phẩm / Phiếu May</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Nhân Viên</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Ngày Hẹn</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Hình Thức</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Trạng Thái</th>
                                <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0] text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {loading ? (
                                <tr><td colSpan="8" className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-[#c9a96e]" size={24} /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="8" className="py-16 text-center text-[#9999b0] font-medium text-[13px]">Không có lịch hẹn nào.</td></tr>
                            ) : filtered.map(s => {
                                const cfg = STATUS_CONFIG[s.status] || {};
                                const parsed = parseNotes(s.notes);
                                return (
                                    <tr key={s.id} className="hover:bg-[#f8f8fc] border-b border-[#f4f4f8] transition-colors group relative">
                                        <td className="px-5 py-3" onClick={() => setSelected(s)}>
                                            <span className="font-mono font-bold text-[#0d0e17] text-[13px] cursor-pointer group-hover:text-[#c9a96e] transition-colors">#{s.id}</span>
                                            {s.tailoringOrderId && <div className="text-[10px] font-mono font-bold text-[#9999b0] mt-0.5">Phiếu may #{s.tailoringOrderId}</div>}
                                        </td>
                                        <td className="px-5 py-3" onClick={() => setSelected(s)}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0 shadow-sm"
                                                    style={{ background: 'linear-gradient(135deg, #c9a96e, #e2c08a)' }}>
                                                    {(s.customerName || '?')[0]}
                                                </div>
                                                <span className="font-bold text-[#0d0e17] text-[13px] cursor-pointer">{s.customerName || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3" onClick={() => setSelected(s)}>
                                            <div className="font-bold text-[#0d0e17] cursor-pointer">{s.productName || '(Dịch vụ Tư vấn)'}</div>
                                            {s.orderId && <div className="text-[11px] font-mono text-[#9999b0]">Đơn #{s.orderId}</div>}
                                        </td>
                                        <td className="px-5 py-3" onClick={() => setSelected(s)}>
                                            {s.staffName ? (
                                                <div className="flex items-center gap-2 cursor-pointer">
                                                    <div className="w-6 h-6 rounded-full bg-[#f4f4f8] flex items-center justify-center text-[10px] font-bold text-[#6b6b80] shadow-sm">{s.staffName[0]}</div>
                                                    <span className="font-bold text-[#6b6b80] text-[12px]">{s.staffName}</span>
                                                </div>
                                            ) : <span className="text-[#9999b0] text-[12px]">(Chưa gán)</span>}
                                        </td>
                                        <td className="px-5 py-3 font-mono text-[#6b6b80] text-[11px]" onClick={() => setSelected(s)}>
                                            {formatDate(s.fittingDate)}
                                        </td>
                                        <td className="px-5 py-3" onClick={() => setSelected(s)}>
                                            {parsed.isVirtual ? (
                                                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                    <Video size={12} /> Online
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6b6b80] bg-[#f4f4f8] px-2 py-0.5 rounded border border-[#e8e8f0]">
                                                    Trực tiếp
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3" onClick={() => setSelected(s)}>
                                            <div className="cursor-pointer">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold ${cfg.color}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                                                    {cfg.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-2">
                                                {updating === s.id ? (
                                                    <Loader2 className="animate-spin text-[#c9a96e]" size={16} />
                                                ) : (
                                                    <div className="relative inline-block">
                                                        <select value={s.status} onChange={e => handleStatusUpdate(s.id, e.target.value)}
                                                            className="appearance-none bg-[#f4f4f8] border border-[#e8e8f0] rounded-md text-[11px] font-bold px-2 py-1 pr-6 outline-none focus:border-[#c9a96e] cursor-pointer hover:bg-[#e8e8f0] transition-colors text-[#0d0e17]">
                                                            {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                                                                <option key={val} value={val}>{label}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b6b80] pointer-events-none" />
                                                    </div>
                                                )}
                                                <button onClick={() => openEditModal(s)}
                                                    className="p-1.5 text-[#9999b0] hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Sửa lịch">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                </button>
                                                <button onClick={() => handleDelete(s.id)}
                                                    className="p-1.5 text-[#9999b0] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Xóa">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {!loading && filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-[#e8e8f0] text-[11px] font-bold text-[#9999b0] bg-white uppercase tracking-wider flex justify-between items-center">
                        Hiển thị <span className="text-[#0d0e17]">{filtered.length}</span> / {sessions.length} lịch hẹn
                    </div>
                )}
            </div>

            {/* Detail Drawer */}
            {selected && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0c17]/60 backdrop-blur-sm p-4 transition-opacity" onClick={() => setSelected(null)}>
                    <div className="bg-white w-full max-w-[600px] h-auto max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-7 py-6 border-b border-[#f4f4f8]">
                            <h2 className="text-xl font-bold text-[#0d0e17]">
                                Chi Tiết Lịch Hẹn <span className="text-[#c9a96e] font-mono">#{selected.id}</span>
                            </h2>
                            <button onClick={() => setSelected(null)} className="p-2 bg-[#f4f4f8] hover:bg-[#e8e8f0] rounded-full text-[#6b6b80] transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto admin-scroll bg-[#f8f8fc] p-7 space-y-5">
                            <div className="bg-white p-6 rounded-2xl border border-[#e8e8f0] shadow-sm">
                                <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-[13px]">
                                    <div><span className="text-[#9999b0] block text-[10px] font-bold uppercase mb-1">Cô Dâu</span><div className="font-bold text-[#0d0e17]">{selected.customerName || 'N/A'}</div></div>
                                    <div><span className="text-[#9999b0] block text-[10px] font-bold uppercase mb-1">Nhân Viên</span><div className="font-bold text-[#0d0e17]">{selected.staffName || '(Chưa gán)'}</div></div>
                                    <div><span className="text-[#9999b0] block text-[10px] font-bold uppercase mb-1">Dịch vụ</span><div className="font-bold text-[#0d0e17]">{selected.productName || '—'}</div></div>
                                    <div><span className="text-[#9999b0] block text-[10px] font-bold uppercase mb-1">Trạng Thái</span>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold ${STATUS_CONFIG[selected.status]?.color}`}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CONFIG[selected.status]?.dot }} />
                                            {STATUS_CONFIG[selected.status]?.label}
                                        </span>
                                    </div>
                                    <div className="col-span-2"><span className="text-[#9999b0] block text-[10px] font-bold uppercase mb-1">Ngày & Giờ Thử</span>
                                        <div className="font-bold text-[#0d0e17] text-[15px]">{formatDate(selected.fittingDate)}</div>
                                    </div>
                                    
                                    <div className="col-span-2 space-y-2">
                                        <span className="text-[#9999b0] block text-[10px] font-bold uppercase mb-1">Thông tin tư vấn</span>
                                        {(() => {
                                            const parsed = parseNotes(selected.notes);
                                            return (
                                                <div className="bg-[#f8f8fc] rounded-xl p-3 text-[13px] border border-[#e8e8f0] space-y-3">
                                                    {parsed.isVirtual ? (
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-2 rounded-lg font-bold border border-blue-100">
                                                                <Video size={16} /> Lịch hẹn Tư vấn Online (Virtual)
                                                            </div>
                                                            {parsed.meetingLink && (
                                                                <a href={parsed.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e8e8f0] rounded-lg text-blue-600 hover:border-blue-300 transition-colors w-fit font-semibold text-[12px]">
                                                                    Tham gia ngay <LinkIcon size={12} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-[#6b6b80] font-medium">Lịch hẹn trực tiếp tại cửa hàng.</div>
                                                    )}
                                                    {parsed.notes && (
                                                        <div className="pt-2 border-t border-[#e8e8f0] text-[#0d0e17]">
                                                            <span className="font-bold text-[#6b6b80] text-[11px] uppercase mr-2">Ghi chú:</span> 
                                                            {parsed.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-[#e8e8f0] shadow-sm">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9999b0] mb-4">Cập Nhật Trạng Thái</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                        <button key={key} disabled={selected.status === key || updating === selected.id}
                                            onClick={() => handleStatusUpdate(selected.id, key)}
                                            className={`py-2.5 rounded-xl text-[12px] font-bold border transition-all ${
                                                selected.status === key ? `${cfg.color} cursor-default` : 'bg-[#f8f8fc] text-[#6b6b80] border-[#e8e8f0] hover:border-[#c9a96e] hover:text-[#0d0e17] hover:bg-white'
                                            }`}>
                                            {selected.status === key && '✓ '}{cfg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Schedule Modal */}
            {scheduleModal && createPortal(
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0b0c17]/50 p-4 backdrop-blur-md" onClick={() => setScheduleModal(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md admin-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-7 py-6 border-b border-[#f4f4f8]">
                            <h2 className="text-[16px] font-black text-[#0d0e17]">Tạo Lịch Hẹn</h2>
                            <button onClick={() => setScheduleModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-[#9999b0] hover:bg-[#f4f4f8] transition-colors"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleScheduleSubmit} className="p-7 space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6b6b80] mb-2">Ngày & Giờ Hẹn *</label>
                                <input required type="datetime-local" value={form.fittingDate} onChange={e => setForm({ ...form, fittingDate: e.target.value })}
                                    className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[14px] font-medium text-[#0d0e17] outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                            </div>
                            
                            <div className="bg-[#f8f8fc] p-4 rounded-xl border border-[#e8e8f0] space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={form.isVirtual} onChange={e => setForm({...form, isVirtual: e.target.checked})} className="accent-[#c9a96e] w-4 h-4 cursor-pointer" />
                                    <span className="text-[13px] font-bold text-[#0d0e17]">Là Tư vấn Online (Virtual Consultation)</span>
                                </label>
                                {form.isVirtual && (
                                    <div>
                                        <input type="url" placeholder="Nhập Link Google Meet hoặc Zoom..." value={form.meetingLink} onChange={e => setForm({...form, meetingLink: e.target.value})}
                                            className="w-full bg-white border border-[#e8e8f0] rounded-lg p-2.5 text-[12px] text-[#0d0e17] outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6b6b80] mb-2">Ghi Chú Nội Bộ</label>
                                <textarea rows="3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Ghi chú buổi tư vấn..."
                                    className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[14px] text-[#0d0e17] outline-none focus:border-[#c9a96e] focus:bg-white transition-all resize-none" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-[#f4f4f8]">
                                <button type="button" onClick={() => setScheduleModal(null)}
                                    className="px-6 py-3 text-[#0d0e17] bg-[#f4f4f8] hover:bg-[#e8e8f0] rounded-xl font-bold transition-colors text-[13px]">Hủy</button>
                                <button type="submit" disabled={isSaving}
                                    className="px-6 py-3 bg-[#0d0e17] text-white rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-black/20 text-[13px]">
                                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                                    {isSaving ? 'Đang lưu...' : 'Tạo Lịch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Edit Session Modal */}
            {editModal && createPortal(
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#0b0c17]/60 backdrop-blur-sm p-4" onClick={() => setEditModal(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-7 py-5 border-b border-[#f4f4f8]">
                            <div>
                                <h2 className="text-[16px] font-black text-[#0d0e17]">Sửa Lịch Hẹn</h2>
                                <p className="text-[12px] text-[#9999b0]">#{editModal.id} · {editModal.customerName}</p>
                            </div>
                            <button onClick={() => setEditModal(null)} className="p-2 rounded-full hover:bg-[#f4f4f8] text-[#9999b0]"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-7 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b6b80] mb-1.5">Ngày & Giờ Hẹn *</label>
                                <input required type="datetime-local" value={editForm.fittingDate}
                                    onChange={e => setEditForm({...editForm, fittingDate: e.target.value})}
                                    className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[13px] outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                            </div>
                            
                            <div className="bg-[#f8f8fc] p-4 rounded-xl border border-[#e8e8f0] space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={editForm.isVirtual} onChange={e => setEditForm({...editForm, isVirtual: e.target.checked})} className="accent-[#c9a96e] w-4 h-4 cursor-pointer" />
                                    <span className="text-[13px] font-bold text-[#0d0e17]">Tư vấn Online (Virtual Consultation)</span>
                                </label>
                                {editForm.isVirtual && (
                                    <div>
                                        <input type="url" placeholder="Link Google Meet hoặc Zoom..." value={editForm.meetingLink} onChange={e => setEditForm({...editForm, meetingLink: e.target.value})}
                                            className="w-full bg-white border border-[#e8e8f0] rounded-lg p-2.5 text-[12px] text-[#0d0e17] outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b6b80] mb-1.5">Trạng thái</label>
                                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}
                                    className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[13px] outline-none focus:border-[#c9a96e] focus:bg-white transition-all">
                                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b6b80] mb-1.5">Ghi Chú</label>
                                <textarea rows="3" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})}
                                    placeholder="Ghi chú thêm..."
                                    className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[13px] outline-none focus:border-[#c9a96e] focus:bg-white transition-all resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setEditModal(null)}
                                    className="flex-1 py-3 bg-[#f4f4f8] rounded-xl font-bold text-[13px] hover:bg-[#e8e8f0] transition-colors">Hủy</button>
                                <button type="submit" disabled={isEditSaving}
                                    className="flex-1 py-3 bg-[#0d0e17] text-white rounded-xl font-bold text-[13px] hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg">
                                    {isEditSaving && <Loader2 size={14} className="animate-spin" />}
                                    Cập nhật lịch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Confirm Dialog */}
            {confirmData && (
                <ConfirmDialog
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}
        </div>
    );
};

export default ManageFittingSessions;
