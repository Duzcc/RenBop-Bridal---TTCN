import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../../utils/apiClient';
import { useToast } from '../../context/ToastContext';
import { Trash2, Shield, User, Search, Mail, Phone, RefreshCw, UserCheck, UserX, Crown, X, Plus, Loader2, Ruler, PenBox, ShieldCheck, ShieldOff, Star, Heart, Calendar } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';

const EMPTY_M = { label: '', gender: 'FEMALE', bust: '', waist: '', hip: '', shoulder: '', armLength: '', note: '' };
const EMPTY_USER = { name: '', email: '', phone: '', password: '', role: 'ROLE_USER' };

const ManageCustomers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading]   = useState(true);
    const { showToast }           = useToast();
    const [search, setSearch]     = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [activeTab, setActiveTab]       = useState('info');       // 'info' | 'measurements'
    const [measurements, setMeasurements] = useState([]);
    const [mLoading, setMLoading]         = useState(false);
    const [mForm, setMForm]               = useState(EMPTY_M);
    const [editingM, setEditingM]         = useState(null);
    const [mSaving, setMSaving]           = useState(false);

    // Create/Edit user modal
    const [userModal, setUserModal]       = useState(null); // null | 'create' | 'edit'
    const [userForm, setUserForm]         = useState(EMPTY_USER);
    const [userSaving, setUserSaving]     = useState(false);

    useEffect(() => {
        setCurrentPage(1);
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search, filterRole]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let query = '/admin/users?size=200';
            if (filterRole !== 'ALL') query += `&role=${filterRole}`;
            if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
            
            const res = await apiClient(query);
            if (res.success && res.data?.content) setUsers(res.data.content);
            else setUsers([]);
        } catch (error) {
            console.error(error);
            showToast('❌ Không thể tải danh sách người dùng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Xóa khách hàng "${name}"?`)) return;
        try {
            const res = await apiClient(`/admin/users/${id}`, { method: 'DELETE' });
            if (res.success) {
                setUsers(prev => prev.filter(u => u.id !== id));
                showToast(`✅ Đã xóa "${name}"`);
                if (selectedUser?.id === id) setSelectedUser(null);
            }
        } catch { showToast('❌ Lỗi khi xóa người dùng', 'error'); }
    };

    const handleRoleChange = async (userId, newRole) => {
        const label = newRole === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng';
        if (!window.confirm(`Đổi quyền tài khoản này thành "${label}"?`)) return;
        try {
            const res = await apiClient(`/admin/users/${userId}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role: newRole })
            });
            if (res.success) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
                if (selectedUser?.id === userId) setSelectedUser(s => ({ ...s, role: newRole }));
                showToast(`✅ Đã cập nhật quyền → ${label}`);
            }
        } catch (err) { showToast(`❌ Lỗi: ${err.message}`); }
    };

    const openCreateModal = () => {
        setUserForm(EMPTY_USER);
        setUserModal('create');
    };

    const openEditModal = (u) => {
        setUserForm({ name: u.name || '', email: u.email || '', phone: u.phone || '', password: '', role: u.role || 'ROLE_USER' });
        setUserModal('edit');
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setUserSaving(true);
        try {
            let res;
            if (userModal === 'create') {
                res = await apiClient('/admin/users', { method: 'POST', body: JSON.stringify(userForm) });
                if (res.success) { showToast('✅ Tạo tài khoản thành công'); fetchUsers(); }
            } else {
                res = await apiClient(`/admin/users/${selectedUser.id}`, { method: 'PUT', body: JSON.stringify({ name: userForm.name, phone: userForm.phone }) });
                if (res.success) {
                    const updated = { ...selectedUser, name: userForm.name, phone: userForm.phone };
                    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
                    setSelectedUser(updated);
                    showToast('✅ Cập nhật thông tin thành công');
                }
            }
            setUserModal(null);
        } catch (err) { showToast(`❌ Lỗi: ${err.message}`); }
        finally { setUserSaving(false); }
    };

    const openDrawer = (u) => {
        setSelectedUser(u);
        setActiveTab('info');
        setMeasurements([]);
        setMForm(EMPTY_M);
        setEditingM(null);
    };

    const fetchMeasurements = async (userId) => {
        setMLoading(true);
        try {
            const res = await apiClient(`/measurements/user/${userId}`);
            if (res.success) setMeasurements(res.data || []);
        } catch { showToast('❌ Không thể tải số đo', 'error'); }
        finally { setMLoading(false); }
    };

    const handleSaveM = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        setMSaving(true);
        try {
            const payload = {
                label: mForm.label || null,
                gender: mForm.gender || 'FEMALE',
                bust: parseFloat(mForm.bust) || null,
                waist: parseFloat(mForm.waist) || null,
                hip: parseFloat(mForm.hip) || null,
                shoulder: parseFloat(mForm.shoulder) || null,
                armLength: parseFloat(mForm.armLength) || null,
                note: mForm.note,
            };
            const url    = editingM ? `/measurements/${editingM.id}` : `/measurements/user/${selectedUser.id}`;
            const method = editingM ? 'PUT' : 'POST';
            const res = await apiClient(url, { method, body: JSON.stringify(payload) });
            if (res.success) {
                showToast(editingM ? '✅ Cập nhật số đo thành công' : '✅ Thêm số đo thành công');
                setMForm(EMPTY_M);
                setEditingM(null);
                fetchMeasurements(selectedUser.id);
            }
        } catch (err) { showToast(`❌ Lỗi: ${err.message}`, 'error'); }
        finally { setMSaving(false); }
    };

    const handleDeleteM = async (mId) => {
        if (!window.confirm('Xóa số đo này?')) return;
        try {
            const res = await apiClient(`/measurements/${mId}`, { method: 'DELETE' });
            if (res.success) {
                setMeasurements(prev => prev.filter(m => m.id !== mId));
                showToast('✅ Đã xóa số đo');
            }
        } catch { showToast('❌ Lỗi khi xóa số đo', 'error'); }
    };

    const filtered = users;
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const adminCount    = users.filter(u => u.role === 'ROLE_ADMIN').length;
    const customerCount = users.filter(u => u.role !== 'ROLE_ADMIN').length;

    // VIP tier logic based on available backend fields (Ultra Luxury Upgrade)
    const getVipTier = (u) => {
        const spend = u.totalSpend || 0;
        const orders = u.orderCount || 0;
        if (spend >= 60000000 || orders >= 15) return { label: 'DIAMOND VIP', bg: 'bg-cyan-50 border border-cyan-200 shadow-sm shadow-cyan-100', text: 'text-cyan-600', icon: '💎' };
        if (spend >= 35000000 || orders >= 10) return { label: 'PLATINUM VIP', bg: 'bg-violet-50 border border-violet-200 shadow-sm shadow-violet-100', text: 'text-violet-600', icon: '✨' };
        if (spend >= 15000000 || orders >= 5)  return { label: 'GOLD VIP', bg: 'bg-amber-50 border border-amber-200 shadow-sm shadow-amber-100', text: 'text-[#a07840]', icon: '👑' };
        if (spend >= 5000000 || orders >= 2)   return { label: 'SILVER MEMBER', bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-600', icon: '🥈' };
        return { label: 'BRONZE MEMBER', bg: 'bg-amber-50/40 border border-amber-100', text: 'text-amber-700', icon: '🥉' };
    };

    const AVATAR_COLORS = [
        'from-[#c9a96e] to-[#e2c08a]',
        'from-[#10b981] to-[#059669]',
        'from-[#3b82f6] to-[#2563eb]',
        'from-[#8b5cf6] to-[#7c3aed]',
        'from-[#f59e0b] to-[#d97706]',
        'from-[#ef4444] to-[#dc2626]',
    ];
    const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

    return (
        <div className="w-full h-full flex flex-col p-6 space-y-4 font-sans bg-[#f4f4f8]">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#0d0e17]">Quản lý Tài khoản</h1>
                    <p className="text-[12px] font-medium text-[#6b6b80] mt-0.5">
                        {users.length} tài khoản &middot; <span className="text-[#c9a96e] font-semibold">{adminCount} quản trị viên</span>
                    </p>
                </div>
                
                {/* Compact Stats */}
                <div className="hidden lg:flex items-center gap-4 bg-white rounded-xl border border-[#e8e8f0] px-4 py-2 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#f4f4f8] text-[#3b82f6] flex items-center justify-center shrink-0"><User size={12} /></div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#9999b0] leading-none mb-0.5">Tổng tài khoản</p>
                            <p className="text-[14px] font-black text-[#0d0e17] leading-none">{users.length}</p>
                        </div>
                    </div>
                    <div className="w-px h-6 bg-[#e8e8f0]" />
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><UserCheck size={12} /></div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#9999b0] leading-none mb-0.5">Khách hàng</p>
                            <p className="text-[14px] font-black text-[#0d0e17] leading-none">{customerCount}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={fetchUsers} className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e8e8f0] rounded-xl text-[12px] font-bold hover:bg-[#f8f8fc] transition-all shadow-sm">
                        <RefreshCw size={14} />
                    </button>
                    <button onClick={openCreateModal} className="flex items-center gap-1.5 bg-[#0d0e17] hover:bg-black text-white px-4 py-2 rounded-xl text-[12px] font-bold transition-all shadow-sm">
                        <Plus size={14} /> Thêm Khách
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#e8e8f0] shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f4f4f8] bg-white">
                    <div className="relative flex-[2] max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9999b0] pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            className="w-full pl-8 pr-3 py-1.5 bg-[#f8f8fc] border border-transparent rounded-lg text-[13px] outline-none focus:border-[#c9a96e] focus:bg-white transition-all"
                        />
                    </div>
                    <div className="h-5 w-px bg-[#e8e8f0]" />
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {[
                            { val: 'ALL',         label: 'Tất cả' },
                            { val: 'ROLE_ADMIN',  label: 'Quản trị viên' },
                            { val: 'ROLE_USER',   label: 'Khách hàng' },
                        ].map(({ val, label }) => (
                            <button key={val} onClick={() => setFilterRole(val)}
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${filterRole === val ? 'bg-[#f4f4f8] text-[#0d0e17]' : 'text-[#6b6b80] hover:bg-[#f8f8fc]'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-auto admin-scroll bg-[#f8f8fc]">
                    <table className="w-full text-left text-[13px] border-collapse">
                        <thead className="bg-white sticky top-0 z-10 shadow-sm">
                            <tr>
                                {['Tài khoản', 'Email', 'Vai trò', 'Hạng', 'Ngày tham gia', 'Thao tác'].map(h => (
                                    <th key={h} className={`px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0] ${h === 'Thao tác' ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-[#f4f4f8]">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#f4f4f8] animate-pulse shrink-0" />
                                                <div className="space-y-1.5">
                                                    <div className="h-3 bg-[#f4f4f8] rounded animate-pulse w-24" />
                                                    <div className="h-2.5 bg-[#f4f4f8] rounded animate-pulse w-12" />
                                                </div>
                                            </div>
                                        </td>
                                        {[...Array(4)].map((_, j) => (
                                            <td key={j} className="px-5 py-3">
                                                <div className="h-3 bg-[#f4f4f8] rounded animate-pulse w-20" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <UserX className="mx-auto text-[#e8e8f0] mb-3" size={36} />
                                        <p className="text-[#9999b0] text-[13px] font-medium">Không tìm thấy người dùng nào.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((u) => (
                                    <tr key={u.id}
                                        className="hover:bg-[#f8f8fc] border-b border-[#f4f4f8] transition-colors cursor-pointer group relative"
                                        onClick={() => openDrawer(u)}
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor(u.name)} flex items-center justify-center font-bold text-white text-[12px] uppercase shrink-0 shadow-sm`}>
                                                    {u.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#0d0e17] text-[13px] leading-tight mb-0.5 group-hover:text-[#c9a96e] transition-colors">{u.name}</p>
                                                    <p className="text-[11px] font-mono font-bold text-[#9999b0]">#{u.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 font-medium text-[#6b6b80]">{u.email}</td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wide ${u.role === 'ROLE_ADMIN' ? 'bg-[#c9a96e]/10 text-[#c9a96e]' : 'bg-[#f4f4f8] text-[#6b6b80]'}`}>
                                                {u.role === 'ROLE_ADMIN' ? <><Crown size={10} /> Quản trị viên</> : <><User size={10} /> Khách hàng</>}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {(() => { const t = getVipTier(u); return t ? (
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black ${t.bg} ${t.text}`}>
                                                    {t.icon} {t.label}
                                                </span>
                                            ) : <span className="text-[10px] text-[#c8c8d8] font-medium">—</span>; })()}
                                        </td>
                                        <td className="px-5 py-3 text-[#9999b0] font-mono text-[11px]">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                                        </td>
                                        <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                {u.role !== 'ROLE_ADMIN' && (
                                                    <button
                                                        onClick={() => handleDelete(u.id, u.name)}
                                                        className="p-1.5 text-[#9999b0] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Xóa người dùng"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-[#f4f4f8] text-[11px] font-bold text-[#9999b0] bg-white uppercase tracking-wider">
                        Hiển thị <span className="text-[#0d0e17]">{filtered.length}</span> / {users.length} người dùng
                    </div>
                )}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            {selectedUser && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0c17]/60 backdrop-blur-sm p-4 transition-opacity" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white w-full max-w-[500px] h-auto max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {/* Drawer Header */}
                        <div className="flex justify-between items-center px-7 py-5 border-b border-[#f4f4f8] bg-white shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-[#0d0e17]">{selectedUser.name}</h2>
                                <p className="text-[12px] font-mono text-[#9999b0]">ID #{selectedUser.id}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 bg-[#f4f4f8] hover:bg-[#e8e8f0] rounded-full text-[#6b6b80] transition-colors"><X size={18} /></button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-[#f4f4f8] shrink-0">
                            {[{ key: 'info', label: 'Thông Tin' }, { key: 'measurements', label: '📏 Số Đo' }].map(tab => (
                                <button key={tab.key}
                                    onClick={() => { setActiveTab(tab.key); if (tab.key === 'measurements') fetchMeasurements(selectedUser.id); }}
                                    className={`flex-1 py-3.5 text-[13px] font-semibold transition-colors relative ${activeTab === tab.key ? 'text-[#c9a96e]' : 'text-[#6b6b80] hover:text-[#0d0e17]'}`}>
                                    {tab.label}
                                    {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a96e]" />}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto admin-scroll bg-[#f8f8fc] p-6">
                            {activeTab === 'info' ? (
                                <div className="space-y-4">
                                    {/* Avatar banner */}
                                    <div className="bg-white rounded-2xl border border-[#e8e8f0] shadow-sm overflow-hidden">
                                        <div className={`h-20 bg-gradient-to-br ${avatarColor(selectedUser.name)}`} />
                                        <div className="px-6 pb-5 -mt-8">
                                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${avatarColor(selectedUser.name)} flex items-center justify-center font-bold text-white text-2xl uppercase border-4 border-white shadow-lg mb-3`}>
                                                {selectedUser.name?.[0] || 'U'}
                                            </div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-[#0d0e17] text-[16px]">{selectedUser.name}</h3>
                                                {(() => { const t = getVipTier(selectedUser); return t ? (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black ${t.bg} ${t.text}`}>
                                                        {t.icon} {t.label}
                                                    </span>
                                                ) : null; })()}
                                            </div>
                                            <p className="text-[12px] text-[#9999b0] font-mono">ID #{selectedUser.id}</p>
                                            {(selectedUser.orderCount || selectedUser.totalSpend) && (
                                                <div className="flex gap-3 mt-3">
                                                    {selectedUser.orderCount != null && (
                                                        <div className="bg-[#f8f8fc] rounded-xl px-3 py-2 text-center border border-[#e8e8f0]">
                                                            <div className="text-[10px] font-bold text-[#9999b0] uppercase">Đơn hàng</div>
                                                            <div className="text-[14px] font-black text-[#0d0e17]">{selectedUser.orderCount}</div>
                                                        </div>
                                                    )}
                                                    {selectedUser.totalSpend != null && (
                                                        <div className="bg-[#f8f8fc] rounded-xl px-3 py-2 text-center border border-[#e8e8f0]">
                                                            <div className="text-[10px] font-bold text-[#9999b0] uppercase">Chi tiêu</div>
                                                            <div className="text-[12px] font-black text-[#c9a96e]">
                                                                {new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(selectedUser.totalSpend)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Wedding Countdown Widget (Mock for Bride Profile) */}
                                    <div className="bg-white rounded-2xl border border-[#e8e8f0] shadow-sm p-5 relative overflow-hidden group">
                                        <div className="absolute -right-6 -top-6 text-[#c9a96e]/10 group-hover:scale-110 transition-transform duration-500">
                                            <Heart size={120} />
                                        </div>
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9999b0] mb-1">Ngày Cưới Dự Kiến</h3>
                                                <p className="text-[16px] font-black text-[#0d0e17] flex items-center gap-1.5">
                                                    <Calendar size={16} className="text-[#c9a96e]" /> 12/10/2026
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[28px] font-black text-[#c9a96e] leading-none">65</div>
                                                <div className="text-[10px] font-bold uppercase text-[#9999b0] mt-1">Ngày nữa</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Style Preferences (Mock for CRM) */}
                                    <div className="bg-white rounded-2xl border border-[#e8e8f0] shadow-sm p-5 space-y-4">
                                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9999b0] pb-2 border-b border-[#f4f4f8]">Hồ sơ Cưới & Stylist</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-[#9999b0] mb-1.5">Dáng váy yêu thích</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className="px-2 py-1 bg-[#f8f8fc] border border-[#e8e8f0] rounded-md text-[11px] font-bold text-[#0d0e17]">Đuôi cá</span>
                                                    <span className="px-2 py-1 bg-[#f8f8fc] border border-[#e8e8f0] rounded-md text-[11px] font-bold text-[#0d0e17]">Chữ A</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-[#9999b0] mb-1.5">Ngân sách dự kiến</p>
                                                <p className="text-[14px] font-black text-[#c9a96e]">~ 50.000.000 ₫</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-bold uppercase text-[#9999b0] mb-1.5">Ghi chú từ Stylist</p>
                                                <div className="text-[12px] text-[#6b6b80] font-medium italic bg-[#f8f8fc] p-3 rounded-xl border border-[#e8e8f0]">
                                                    "Khách thích ren Pháp cổ điển, không thích đính đá quá nhiều. Vai hơi xuôi cần chú ý đệm vai."
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="bg-white rounded-2xl border border-[#e8e8f0] shadow-sm p-5 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-[#f8f8fc] rounded-xl border border-[#e8e8f0]">
                                            <Mail size={15} className="text-[#9999b0] shrink-0" />
                                            <span className="text-[#0d0e17] font-medium text-[13px] break-all">{selectedUser.email}</span>
                                        </div>
                                        {selectedUser.phone && (
                                            <div className="flex items-center gap-3 p-3 bg-[#f8f8fc] rounded-xl border border-[#e8e8f0]">
                                                <Phone size={15} className="text-[#9999b0] shrink-0" />
                                                <span className="text-[#0d0e17] font-medium text-[13px]">{selectedUser.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 p-3 bg-[#f8f8fc] rounded-xl border border-[#e8e8f0]">
                                            <Shield size={15} className="text-[#9999b0] shrink-0" />
                                            <span className={`font-bold text-[13px] ${selectedUser.role === 'ROLE_ADMIN' ? 'text-[#c9a96e]' : 'text-[#6b6b80]'}`}>
                                                {selectedUser.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng thành viên'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    {/* Sơ đồ số đo trực quan (Ultra Luxury Dossier Card) */}
                                    {measurements.length > 0 && (
                                        <div className="bg-gradient-to-br from-[#0d0e17] to-[#1a1b2e] rounded-3xl p-5 text-white shadow-xl relative overflow-hidden border border-white/5">
                                            <div className="absolute -right-6 -bottom-6 opacity-10 text-white pointer-events-none scale-110">
                                                <Ruler size={130} />
                                            </div>
                                            <div className="flex items-center justify-between mb-4 relative z-10">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]">HỒ SƠ SỐ ĐO MỚI NHẤT</h4>
                                                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-gray-300">Dossier #{measurements[0].id}</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3 relative z-10">
                                                <div className="space-y-2">
                                                    {[
                                                        { label: 'Vòng 1 (Ngực)', value: measurements[0].bust },
                                                        { label: 'Vòng 2 (Eo)', value: measurements[0].waist },
                                                        { label: 'Vòng 3 (Mông)', value: measurements[0].hip }
                                                    ].map(item => (
                                                        <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
                                                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{item.label}</div>
                                                            <div className="flex items-baseline gap-0.5">
                                                                <span className="text-[15px] font-black text-[#c9a96e]">{item.value || '--'}</span>
                                                                <span className="text-[8px] font-bold text-gray-400">cm</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {[
                                                        { label: 'Độ rộng vai', value: measurements[0].shoulder },
                                                        { label: 'Dài tay áo', value: measurements[0].armLength }
                                                    ].map(item => (
                                                        <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
                                                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{item.label}</div>
                                                            <div className="flex items-baseline gap-0.5">
                                                                <span className="text-[15px] font-black text-white">{item.value || '--'}</span>
                                                                <span className="text-[8px] font-bold text-gray-400">cm</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    
                                                    {/* Lưu ý nhỏ */}
                                                    <div className="bg-[#c9a96e]/10 border border-[#c9a96e]/20 rounded-xl p-2 flex flex-col justify-center min-h-[42px]">
                                                        <div className="text-[8px] font-black text-[#c9a96e] uppercase tracking-wider">Lưu ý</div>
                                                        <div className="text-[10px] font-bold text-gray-300 truncate mt-0.5 max-w-[170px]">
                                                            {measurements[0].note || 'Không có ghi chú'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Visual Measurement Form (Inspired by Amsale/GLL) */}
                                    <div className="bg-white rounded-2xl border border-[#e8e8f0] shadow-sm p-6 relative">
                                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#f4f4f8]">
                                            <h3 className="text-[12px] font-black uppercase tracking-widest text-[#0d0e17] flex items-center gap-2">
                                                <PenBox size={14} className="text-[#c9a96e]" />
                                                {editingM ? 'Cập Nhật Số Đo' : 'Thêm Số Đo Mới'}
                                            </h3>
                                        </div>
                                        
                                        <form onSubmit={handleSaveM} className="space-y-5">
                                            {/* Body Measurements - Visual Grid */}
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { key: 'bust',      label: 'Vòng 1 (Ngực)' },
                                                    { key: 'waist',     label: 'Vòng 2 (Eo)' },
                                                    { key: 'hip',       label: 'Vòng 3 (Mông)' },
                                                ].map((f, i) => (
                                                    <div key={f.key} className="bg-[#f8f8fc] rounded-xl p-3 border border-[#e8e8f0] hover:border-[#c9a96e] transition-colors focus-within:border-[#c9a96e] focus-within:bg-white relative">
                                                        <div className="absolute top-2 left-2 text-[#e8e8f0] font-black text-2xl z-0 pointer-events-none opacity-50">
                                                            {i + 1}
                                                        </div>
                                                        <label className="relative z-10 block text-[9px] font-bold uppercase tracking-wider text-[#9999b0] mb-1.5">{f.label}</label>
                                                        <div className="relative z-10 flex items-center">
                                                            <input type="number" step="0.1" value={mForm[f.key]}
                                                                onChange={e => setMForm({ ...mForm, [f.key]: e.target.value })}
                                                                placeholder="0"
                                                                className="w-full bg-transparent text-[16px] font-black text-[#0d0e17] outline-none" />
                                                            <span className="text-[10px] font-bold text-[#c9a96e]">cm</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Other Measurements */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { key: 'shoulder',  label: 'Độ rộng vai' },
                                                    { key: 'armLength', label: 'Chiều dài tay' },
                                                ].map(f => (
                                                    <div key={f.key} className="bg-[#f8f8fc] rounded-xl p-3 border border-[#e8e8f0] hover:border-[#c9a96e] transition-colors focus-within:border-[#c9a96e] focus-within:bg-white">
                                                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#9999b0] mb-1.5">{f.label}</label>
                                                        <div className="flex items-center">
                                                            <input type="number" step="0.1" value={mForm[f.key]}
                                                                onChange={e => setMForm({ ...mForm, [f.key]: e.target.value })}
                                                                placeholder="0"
                                                                className="w-full bg-transparent text-[14px] font-bold text-[#0d0e17] outline-none" />
                                                            <span className="text-[10px] font-bold text-[#c9a96e]">cm</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Label + Gender row */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-[#f8f8fc] rounded-xl p-3 border border-[#e8e8f0] focus-within:border-[#c9a96e] focus-within:bg-white transition-colors">
                                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#9999b0] mb-1.5">Nhãn phiên đo</label>
                                                    <input type="text" value={mForm.label}
                                                        onChange={e => setMForm({ ...mForm, label: e.target.value })}
                                                        placeholder="VD: Váy cưới tháng 6"
                                                        className="w-full bg-transparent text-[13px] font-medium text-[#0d0e17] outline-none" />
                                                </div>
                                                <div className="bg-[#f8f8fc] rounded-xl p-3 border border-[#e8e8f0] focus-within:border-[#c9a96e] focus-within:bg-white transition-colors">
                                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#9999b0] mb-1.5">Giới tính</label>
                                                    <select value={mForm.gender} onChange={e => setMForm({ ...mForm, gender: e.target.value })}
                                                        className="w-full bg-transparent text-[13px] font-bold text-[#0d0e17] outline-none">
                                                        <option value="FEMALE">♀ Nữ</option>
                                                        <option value="MALE">♂ Nam</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="bg-[#f8f8fc] rounded-xl p-3 border border-[#e8e8f0] focus-within:border-[#c9a96e] focus-within:bg-white transition-colors">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#9999b0] mb-1.5">Ghi chú thêm</label>
                                                <input type="text" value={mForm.note}
                                                    onChange={e => setMForm({ ...mForm, note: e.target.value })}
                                                    placeholder="Lưu ý về form dáng, cách lấy số đo..."
                                                    className="w-full bg-transparent text-[13px] font-medium text-[#0d0e17] outline-none" />
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                {editingM && (
                                                    <button type="button" onClick={() => { setEditingM(null); setMForm(EMPTY_M); }}
                                                        className="px-5 py-3 text-[12px] font-bold text-[#6b6b80] bg-[#f8f8fc] rounded-xl hover:bg-[#e8e8f0] hover:text-[#0d0e17] transition-colors">
                                                        Hủy
                                                    </button>
                                                )}
                                                <button type="submit" disabled={mSaving}
                                                    className="flex-1 py-3 text-[12px] font-black text-white bg-gradient-to-r from-[#0d0e17] to-[#1a1b2e] rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                                                    {mSaving && <Loader2 size={16} className="animate-spin" />}
                                                    {editingM ? 'Cập Nhật Hồ Sơ' : 'Lưu Hồ Sơ Số Đo'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Measurements List - Timeline Style */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9999b0]">
                                                Lịch sử số đo ({measurements.length})
                                            </h3>
                                        </div>
                                        {mLoading ? (
                                            <div className="py-6 flex justify-center"><Loader2 className="animate-spin text-[#c9a96e]" size={24} /></div>
                                        ) : measurements.length === 0 ? (
                                            <div className="py-8 text-center bg-white rounded-2xl border border-[#e8e8f0] border-dashed">
                                                <Ruler className="mx-auto text-[#c9a96e]/40 mb-3" size={32} />
                                                <p className="text-[13px] text-[#9999b0] font-medium">Chưa có bản ghi số đo nào.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#c9a96e]/20 before:to-transparent">
                                                {measurements.map((m, index) => (
                                                    <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                        {/* Timeline marker */}
                                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#f8f8fc] bg-[#c9a96e] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-[10px] font-black">
                                                            #{measurements.length - index}
                                                        </div>
                                                        {/* Card */}
                                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-[#e8e8f0] shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <span className="text-[10px] font-black text-[#c9a96e] bg-[#c9a96e]/10 px-2 py-0.5 rounded uppercase">Bản ghi {m.id}</span>
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => { setEditingM(m); setMForm({ label: m.label || '', gender: m.gender || 'FEMALE', bust: m.bust || '', waist: m.waist || '', hip: m.hip || '', shoulder: m.shoulder || '', armLength: m.armLength || '', note: m.note || '' }); }} className="p-1.5 text-[#9999b0] hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><PenBox size={14}/></button>
                                                                    <button onClick={() => handleDeleteM(m.id)} className="p-1.5 text-[#9999b0] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14}/></button>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-1.5 text-center mb-2">
                                                                {[['V1', m.bust], ['V2', m.waist], ['V3', m.hip]].map(([l, v]) => (
                                                                    <div key={l} className="bg-[#f8f8fc] rounded-lg p-1.5">
                                                                        <div className="text-[9px] font-bold text-[#9999b0]">{l}</div>
                                                                        <div className="text-[12px] font-black text-[#0d0e17]">{v||'-'}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-1.5 text-center mb-2">
                                                                {[['Vai', m.shoulder], ['Tay', m.armLength]].map(([l, v]) => (
                                                                    <div key={l} className="border border-[#f4f4f8] rounded-lg p-1.5">
                                                                        <div className="text-[9px] font-bold text-[#9999b0]">{l}</div>
                                                                        <div className="text-[11px] font-bold text-[#0d0e17]">{v||'-'}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {m.note && <div className="mt-2 text-[11px] text-[#6b6b80] bg-[#f4f4f8] p-2 rounded-lg italic">"{m.note}"</div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-5 border-t border-[#e8e8f0] bg-white shrink-0 space-y-2">
                            {/* Role toggle */}
                            {selectedUser.role === 'ROLE_ADMIN' ? (
                                <button onClick={() => handleRoleChange(selectedUser.id, 'ROLE_USER')}
                                    className="w-full py-2.5 text-[12px] font-black text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors flex items-center justify-center gap-2">
                                    <ShieldOff size={14} /> Hạ về Khách hàng
                                </button>
                            ) : (
                                <button onClick={() => handleRoleChange(selectedUser.id, 'ROLE_ADMIN')}
                                    className="w-full py-2.5 text-[12px] font-black text-[#c9a96e] bg-[#c9a96e]/10 border border-[#c9a96e]/30 rounded-xl hover:bg-[#c9a96e]/20 transition-colors flex items-center justify-center gap-2">
                                    <ShieldCheck size={14} /> Nâng lên Quản trị viên
                                </button>
                            )}
                            <div className="flex gap-2">
                                <button onClick={() => setSelectedUser(null)}
                                    className="flex-1 px-4 py-2.5 bg-[#f4f4f8] hover:bg-[#e8e8f0] text-[#0d0e17] rounded-xl font-bold transition-colors text-[12px]">
                                    Đóng
                                </button>
                                <button onClick={() => openEditModal(selectedUser)}
                                    className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold hover:bg-blue-100 transition-colors text-[12px] flex items-center justify-center gap-1.5">
                                    <PenBox size={13} /> Sửa thông tin
                                </button>
                                {selectedUser.role !== 'ROLE_ADMIN' && (
                                    <button onClick={() => handleDelete(selectedUser.id, selectedUser.name)}
                                        className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors text-[12px] flex items-center justify-center gap-1.5">
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Create / Edit User Modal */}
            {userModal && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0b0c17]/60 backdrop-blur-sm p-4" onClick={() => setUserModal(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-7 py-5 border-b border-[#f4f4f8]">
                            <div>
                                <h2 className="text-[16px] font-black text-[#0d0e17]">
                                    {userModal === 'create' ? 'Tạo tài khoản mới' : 'Sửa thông tin'}
                                </h2>
                                {userModal === 'edit' && <p className="text-[12px] text-[#9999b0]">{selectedUser?.name}</p>}
                            </div>
                            <button onClick={() => setUserModal(null)} className="p-2 rounded-full hover:bg-[#f4f4f8] text-[#9999b0] transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveUser} className="p-7 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b6b80] mb-1.5">Họ và tên *</label>
                                <input required type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})}
                                    placeholder="Nguyễn Thị Hoa"
                                    className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[13px] font-medium outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                            </div>
                            {userModal === 'create' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b6b80] mb-1.5">Email *</label>
                                        <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})}
                                            placeholder="email@example.com"
                                            className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[13px] font-medium outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b6b80] mb-1.5">Mật khẩu *</label>
                                        <input required type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})}
                                            placeholder="••••••••"
                                            className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[13px] font-medium outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b6b80] mb-1.5">Vai trò</label>
                                        <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}
                                            className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[13px] font-medium outline-none focus:border-[#c9a96e] focus:bg-white transition-all">
                                            <option value="ROLE_USER">Khách hàng</option>
                                            <option value="ROLE_ADMIN">Quản trị viên</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b6b80] mb-1.5">Số điện thoại</label>
                                <input type="tel" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})}
                                    placeholder="0901 234 567"
                                    className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[13px] font-medium outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setUserModal(null)}
                                    className="flex-1 py-3 bg-[#f4f4f8] text-[#0d0e17] rounded-xl font-bold text-[13px] hover:bg-[#e8e8f0] transition-colors">Hủy</button>
                                <button type="submit" disabled={userSaving}
                                    className="flex-1 py-3 bg-[#0d0e17] text-white rounded-xl font-bold text-[13px] hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg">
                                    {userSaving && <Loader2 size={14} className="animate-spin" />}
                                    {userModal === 'create' ? 'Tạo tài khoản' : 'Cập nhật'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ManageCustomers;
