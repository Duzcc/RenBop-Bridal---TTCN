import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../../utils/apiClient';
import { useToast } from '../../context/ToastContext';
import { Loader2, RefreshCw, Tag, Trash2, PenBox, Plus, X, Search, FolderOpen } from 'lucide-react';

const EMPTY_FORM = { name: '', description: '' };

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const { showToast }               = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCat, setEditingCat]   = useState(null);
    const [form, setForm]               = useState(EMPTY_FORM);
    const [isSaving, setIsSaving]       = useState(false);

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await apiClient('/categories');
            if (res.success) setCategories(res.data?.content || res.data || []);
        } catch { showToast('❌ Không thể tải danh mục'); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditingCat(null);
        setForm(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const openEdit = (cat) => {
        setEditingCat(cat);
        setForm({ name: cat.name || '', description: cat.description || '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCat(null);
        setForm(EMPTY_FORM);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url    = editingCat ? `/categories/${editingCat.id}` : '/categories';
            const method = editingCat ? 'PUT' : 'POST';
            const res = await apiClient(url, { method, body: JSON.stringify(form) });
            if (res.success) {
                showToast(editingCat ? '✅ Đã cập nhật danh mục' : '✅ Tạo danh mục thành công');
                closeModal();
                fetchCategories();
            }
        } catch (err) {
            showToast(`❌ Lỗi: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (cat) => {
        if (!window.confirm(`Xóa danh mục "${cat.name}"? Hành động này không thể khôi phục.`)) return;
        try {
            const res = await apiClient(`/categories/${cat.id}`, { method: 'DELETE' });
            if (res.success) {
                showToast('✅ Đã xóa danh mục');
                fetchCategories();
            }
        } catch (err) {
            showToast(`❌ Lỗi: ${err.message}`);
        }
    };

    const filtered = categories.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.slug?.toLowerCase().includes(search.toLowerCase())
    );

    // Simple color palette for category badges
    const PALETTE = [
        { bg: 'bg-[#c9a96e]/10', text: 'text-[#c9a96e]', border: 'border-[#c9a96e]/30' },
        { bg: 'bg-blue-50',      text: 'text-blue-600',   border: 'border-blue-200' },
        { bg: 'bg-purple-50',    text: 'text-purple-600',  border: 'border-purple-200' },
        { bg: 'bg-emerald-50',   text: 'text-emerald-600', border: 'border-emerald-200' },
        { bg: 'bg-pink-50',      text: 'text-pink-600',    border: 'border-pink-200' },
        { bg: 'bg-orange-50',    text: 'text-orange-600',  border: 'border-orange-200' },
    ];

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6 font-sans">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0d0e17]">Quản lý Danh Mục</h1>
                    <p className="text-[13px] font-medium text-[#6b6b80] mt-0.5">
                        {categories.length} danh mục · {categories.filter(c => (c.productCount || 0) > 0).length} có sản phẩm
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchCategories}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e8e8f0] rounded-xl text-[12px] font-bold hover:bg-[#f8f8fc] transition-all shadow-sm">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={openCreate}
                        className="flex items-center gap-1.5 bg-[#0d0e17] hover:bg-black text-white px-4 py-2 rounded-xl text-[12px] font-bold transition-all shadow-sm">
                        <Plus size={14} /> Thêm Danh Mục
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9999b0]" />
                <input type="text" placeholder="Tìm kiếm danh mục..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#e8e8f0] rounded-xl text-[13px] outline-none focus:border-[#c9a96e] transition-all shadow-sm" />
            </div>

            {/* Kanban Card Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-pulse">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-[160px] bg-white rounded-2xl border border-[#e8e8f0]" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filtered.map((cat, idx) => {
                        const p = PALETTE[idx % PALETTE.length];
                        return (
                            <div key={cat.id}
                                className="relative bg-white rounded-2xl border border-[#e8e8f0] shadow-sm p-5 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-default overflow-hidden">
                                {/* Background accent */}
                                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${p.bg.replace('/10','')}`} style={{background: p.text.includes('c9a96e') ? '#c9a96e' : undefined}} />

                                {/* Icon & Name */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black border ${p.bg} ${p.text} ${p.border} shrink-0`}>
                                    {cat.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-black text-[#0d0e17] text-[14px] leading-tight truncate">{cat.name}</div>
                                    {cat.description ? (
                                        <p className="text-[11px] text-[#9999b0] mt-1 leading-snug line-clamp-2">{cat.description}</p>
                                    ) : (
                                        <p className="text-[11px] text-[#c8c8d8] mt-1 italic">Chưa có mô tả</p>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${(cat.productCount||0) > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-[#f4f4f8] text-[#9999b0]'}`}>
                                        {cat.productCount || 0} SP
                                    </span>
                                    {cat.slug && (
                                        <span className="text-[10px] font-mono text-[#9999b0] truncate max-w-[80px]">/{cat.slug}</span>
                                    )}
                                </div>

                                {/* Hover Actions Overlay */}
                                <div className="absolute inset-0 bg-[#0d0e17]/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                    <button onClick={() => openEdit(cat)}
                                        className="flex items-center gap-2 w-[120px] justify-center px-4 py-2 bg-white text-[#0d0e17] rounded-xl text-[12px] font-black hover:bg-[#c9a96e] hover:text-white transition-colors shadow-lg">
                                        <PenBox size={13} /> Chỉnh sửa
                                    </button>
                                    <button onClick={() => handleDelete(cat)}
                                        className="flex items-center gap-2 w-[120px] justify-center px-4 py-2 bg-red-500 text-white rounded-xl text-[12px] font-black hover:bg-red-600 transition-colors shadow-lg">
                                        <Trash2 size={13} /> Xóa
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Dashed "Add new" card */}
                    <button onClick={openCreate}
                        className="h-[160px] border-2 border-dashed border-[#e8e8f0] rounded-2xl flex flex-col items-center justify-center gap-2 text-[#9999b0] hover:border-[#c9a96e] hover:text-[#c9a96e] hover:bg-[#c9a96e]/5 transition-all group">
                        <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={18} />
                        </div>
                        <span className="text-[12px] font-bold">Thêm danh mục</span>
                    </button>
                </div>
            )}

            {!loading && (
                <p className="text-[11px] font-bold text-[#9999b0] uppercase tracking-wider">
                    Hiển thị <span className="text-[#0d0e17]">{filtered.length}</span> / {categories.length} danh mục
                </p>
            )}

            {/* Create / Edit Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0b0c17]/60 p-4 backdrop-blur-sm" onClick={closeModal}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-7 py-6 border-b border-[#f4f4f8]">
                            <div>
                                <h2 className="text-xl font-bold text-[#0d0e17]">
                                    {editingCat ? 'Chỉnh sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                                </h2>
                                {editingCat && <p className="text-[13px] font-medium text-[#9999b0] mt-0.5">{editingCat.name}</p>}
                            </div>
                            <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full text-[#9999b0] hover:text-[#0d0e17] hover:bg-[#f4f4f8] transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-7 space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6b6b80] mb-2">Tên Danh Mục *</label>
                                <input required type="text" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="VD: Váy Cưới Dài, Đầm Dạ Hội..."
                                    className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[14px] font-medium text-[#0d0e17] outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6b6b80] mb-2">Mô Tả</label>
                                <textarea rows="3" value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Mô tả ngắn về danh mục sản phẩm..."
                                    className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[14px] font-medium text-[#0d0e17] outline-none focus:border-[#c9a96e] focus:bg-white transition-all resize-none" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-[#f4f4f8]">
                                <button type="button" onClick={closeModal}
                                    className="px-6 py-3 text-[#0d0e17] bg-[#f4f4f8] hover:bg-[#e8e8f0] rounded-xl font-bold transition-colors text-[13px]">
                                    Hủy
                                </button>
                                <button type="submit" disabled={isSaving}
                                    className="px-8 py-3 bg-[#0d0e17] hover:bg-black text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-black/20 text-[13px]">
                                    {isSaving && <Loader2 size={16} className="animate-spin text-[#c9a96e]" />}
                                    {isSaving ? 'Đang lưu...' : editingCat ? 'Cập Nhật' : 'Tạo Danh Mục'}
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

export default ManageCategories;
