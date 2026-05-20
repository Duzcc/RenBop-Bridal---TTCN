import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../../utils/apiClient';
import { useToast } from '../../context/ToastContext';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import { 
    Trash2, PenBox, X, Loader2, UploadCloud, Plus, 
    Search, Tag, Package, RefreshCw, Filter, 
    ChevronRight, ChevronDown, ImageIcon, 
    Layers, ShoppingBag, Eye, Archive, MoreHorizontal, CheckCircle2
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';

/* ─── Config ─────────────────────────────────────────────────────── */
const EMPTY_FORM = { name: '', description: '', basePrice: '', salePrice: '', categoryId: '' };
const EMPTY_SKU_FORM = { sku: '', size: '', color: '', status: 'AVAILABLE' };

const SKU_STATUS_CONFIG = {
    AVAILABLE:   { label: 'Sẵn sàng',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200',  dot: '#10b981' },
    RENTED:      { label: 'Đang thuê',  color: 'bg-blue-50    text-blue-700    border-blue-200',     dot: '#3b82f6' },
    MAINTENANCE: { label: 'Bảo trì',    color: 'bg-amber-50   text-amber-700   border-amber-200',    dot: '#f59e0b' },
    DAMAGED:     { label: 'Hư hỏng',    color: 'bg-red-50     text-red-700     border-red-200',      dot: '#ef4444' },
    SOLD:        { label: 'Đã bán',     color: 'bg-gray-50    text-gray-700    border-gray-200',     dot: '#6b7280' },
};

const ManageProducts = () => {
    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const { showToast } = useToast();
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSaving, setIsSaving]       = useState(false);
    const [formData, setFormData]       = useState(EMPTY_FORM);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingImageUrls, setExistingImageUrls] = useState([]);
    const fileInputRef = useRef(null);

    const [isSkuDrawerOpen, setIsSkuDrawerOpen] = useState(false);
    const [selectedProductForSku, setSelectedProductForSku] = useState(null);
    const [skuFormData, setSkuFormData] = useState(EMPTY_SKU_FORM);
    const [editingSku, setEditingSku] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await apiClient('/categories');
            if (res.success) setCategories(res.data?.content || res.data || []);
        } catch (error) { console.error(error); }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await apiClient('/products?size=200');
            if (res.success) setProducts(res.data?.content || []);
        } catch (error) { showToast('❌ Lỗi tải sản phẩm'); }
        finally { setLoading(false); }
    };

    const openCreateDrawer = () => {
        setEditingProduct(null);
        setFormData(EMPTY_FORM);
        setSelectedFiles([]);
        setExistingImageUrls([]);
        setIsDrawerOpen(true);
    };

    const openEditDrawer = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            description: product.description || '',
            basePrice: product.basePrice?.toString() || '',
            salePrice: product.salePrice?.toString() || '',
            categoryId: product.category?.id?.toString() || '',
        });
        setExistingImageUrls(product.imageUrls || []);
        setSelectedFiles([]);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setEditingProduct(null);
        setFormData(EMPTY_FORM);
        setSelectedFiles([]);
        setExistingImageUrls([]);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;
        try {
            const res = await apiClient(`/products/${id}`, { method: 'DELETE' });
            if (res.success) {
                setProducts(prev => prev.filter(p => p.id !== id));
                showToast('✅ Đã xóa sản phẩm');
            }
        } catch (error) { showToast('❌ Lỗi khi xóa sản phẩm'); }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newFiles = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeNewFile = (idx) => setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    const removeExistingUrl = (url) => setExistingImageUrls(prev => prev.filter(u => u !== url));

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const newUrls = await Promise.all(selectedFiles.map(sf => uploadImageToCloudinary(sf.file)));
            const allImageUrls = [...existingImageUrls, ...newUrls];

            const payload = {
                name: formData.name,
                description: formData.description,
                basePrice: parseFloat(formData.basePrice) || 0,
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
                imageUrls: allImageUrls,
            };

            const url    = editingProduct ? `/products/${editingProduct.id}` : '/products';
            const method = editingProduct ? 'PUT' : 'POST';

            const res = await apiClient(url, { method, body: JSON.stringify(payload) });
            if (res.success) {
                closeDrawer();
                fetchProducts();
                showToast(editingProduct ? '✅ Đã cập nhật sản phẩm' : '✅ Đã thêm sản phẩm mới');
            }
        } catch (error) { showToast(`❌ Lỗi: ${error.message}`); }
        finally { setIsSaving(false); }
    };

    const openSkuDrawer = (product) => {
        setSelectedProductForSku(product);
        setIsSkuDrawerOpen(true);
        setSkuFormData(EMPTY_SKU_FORM);
        setEditingSku(null);
    };

    const closeSkuDrawer = () => {
        setIsSkuDrawerOpen(false);
        setSelectedProductForSku(null);
        fetchProducts(); 
    };

    const handleSaveSku = async (e) => {
        e.preventDefault();
        try {
            const url = editingSku
                ? `/product-items/${editingSku.id}`
                : `/product-items/product/${selectedProductForSku.id}`;
            const method = editingSku ? 'PUT' : 'POST';

            const res = await apiClient(url, { method, body: JSON.stringify(skuFormData) });
            if (res.success) {
                const updatedRes = await apiClient(`/product-items/product/${selectedProductForSku.id}`);
                if (updatedRes.success) {
                    setSelectedProductForSku({ ...selectedProductForSku, items: updatedRes.data });
                }
                setSkuFormData(EMPTY_SKU_FORM);
                setEditingSku(null);
                showToast('✅ Đã lưu biến thể (SKU)');
            }
        } catch (error) { showToast('❌ Lỗi khi lưu SKU'); }
    };

    const handleDeleteSku = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa SKU này?')) return;
        try {
            const res = await apiClient(`/product-items/${id}`, { method: 'DELETE' });
            if (res.success) {
                const updatedRes = await apiClient(`/product-items/product/${selectedProductForSku.id}`);
                if (updatedRes.success) {
                    setSelectedProductForSku({ ...selectedProductForSku, items: updatedRes.data });
                }
                showToast('✅ Đã xóa SKU');
            }
        } catch (error) { showToast('❌ Lỗi khi xóa SKU'); }
    };

    const filteredProducts = useMemo(() => {
        setCurrentPage(1);
        return products.filter(p => {
            const matchSearch = !search || 
                p.name?.toLowerCase().includes(search.toLowerCase()) || 
                p.category?.name?.toLowerCase().includes(search.toLowerCase());
            const matchCat = filterCategory === 'ALL' || p.category?.id?.toString() === filterCategory;
            return matchSearch && matchCat;
        }).sort((a, b) => b.id - a.id);
    }, [products, search, filterCategory]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const stats = useMemo(() => {
        const total = products.length;
        const skus = products.reduce((s, p) => s + (p.items?.length || 0), 0);
        const available = products.reduce((s, p) => s + (p.items || []).filter(i => i.status === 'AVAILABLE').length, 0);
        return { total, skus, available };
    }, [products]);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    return (
        <div className="w-full h-full flex flex-col p-6 space-y-4 font-sans bg-[#f4f4f8]">
            {/* Header & Stats Compact */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#0d0e17]">Danh mục Sản phẩm</h1>
                    <p className="text-[12px] font-medium text-[#6b6b80] mt-0.5">Hiển thị {filteredProducts.length} trên tổng số {products.length} sản phẩm</p>
                </div>
                
                {/* Compact Stats */}
                <div className="hidden lg:flex items-center gap-4 bg-white rounded-xl border border-[#e8e8f0] px-4 py-2 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Package size={12} /></div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#9999b0] leading-none mb-0.5">Sản phẩm</p>
                            <p className="text-[14px] font-black text-[#0d0e17] leading-none">{stats.total}</p>
                        </div>
                    </div>
                    <div className="w-px h-6 bg-[#e8e8f0]" />
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 size={12} /></div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#9999b0] leading-none mb-0.5">Sẵn sàng</p>
                            <p className="text-[14px] font-black text-[#0d0e17] leading-none">{stats.available}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={fetchProducts} className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e8e8f0] rounded-xl text-[12px] font-bold hover:bg-[#f8f8fc] transition-all shadow-sm">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={openCreateDrawer} className="flex items-center gap-1.5 bg-[#0d0e17] hover:bg-black text-white px-4 py-2 rounded-xl text-[12px] font-bold transition-all shadow-sm">
                        <Plus size={14} /> Thêm Mới
                    </button>
                </div>
            </div>

            {/* Main Seamless Table Container */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#e8e8f0] shadow-sm overflow-hidden">
                
                {/* Advanced Filter Toolbar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f4f4f8] bg-white">
                    <div className="relative flex-[2] max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9999b0]" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm tên sản phẩm, danh mục..."
                            className="w-full pl-8 pr-3 py-1.5 bg-[#f8f8fc] border border-transparent rounded-lg text-[13px] outline-none focus:border-[#c9a96e] focus:bg-white transition-all" />
                    </div>
                    <div className="h-5 w-px bg-[#e8e8f0]" />
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
                        <button onClick={() => setFilterCategory('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${filterCategory === 'ALL' ? 'bg-[#f4f4f8] text-[#0d0e17]' : 'text-[#6b6b80] hover:bg-[#f8f8fc]'}`}>
                            Tất cả
                        </button>
                        {categories.map(c => (
                            <button key={c.id} onClick={() => setFilterCategory(c.id.toString())}
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${filterCategory === c.id.toString() ? 'bg-[#c9a96e] text-white shadow-sm' : 'text-[#6b6b80] hover:bg-[#f8f8fc]'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-[#f8f8fc] border border-[#e8e8f0] rounded-xl p-0.5 shrink-0 ml-auto shadow-inner">
                        <button onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-[#0d0e17] shadow-sm' : 'text-[#9999b0] hover:text-[#0d0e17]'}`}
                            title="Xem dạng bảng">
                            <Layers size={14} />
                        </button>
                        <button onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#0d0e17] shadow-sm' : 'text-[#9999b0] hover:text-[#0d0e17]'}`}
                            title="Xem dạng lưới đầm cưới">
                            <ImageIcon size={14} />
                        </button>
                    </div>
                </div>

                {/* Data Table / Grid view */}
                <div className="flex-1 overflow-auto admin-scroll bg-[#f8f8fc] animate-in fade-in duration-300">
                    {viewMode === 'table' ? (
                        <table className="w-full text-left text-[13px] border-collapse bg-white">
                            <thead className="bg-white sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Sản Phẩm</th>
                                    <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Giá Niêm Yết</th>
                                    <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Giá KM</th>
                                    <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Danh Mục</th>
                                    <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0]">Kho (SKU)</th>
                                    <th className="px-5 py-3 font-bold text-[#6b6b80] uppercase tracking-wider text-[10px] border-b border-[#e8e8f0] text-right">Quản lý</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {loading ? (
                                    <tr><td colSpan="6" className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-[#c9a96e]" size={24} /></td></tr>
                                ) : paginatedProducts.length === 0 ? (
                                    <tr><td colSpan="6" className="py-16 text-center text-[#9999b0] font-medium text-[13px]">Không tìm thấy sản phẩm nào</td></tr>
                                ) : paginatedProducts.map(p => (
                                    <tr key={p.id} className="hover:bg-[#f8f8fc] border-b border-[#f4f4f8] transition-colors group relative cursor-pointer" onClick={() => openEditDrawer(p)}>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#f8f8fc] overflow-hidden border border-[#e8e8f0] shrink-0">
                                                    <img src={p.imageUrls?.[0] || 'https://images.unsplash.com/photo-1594552072238-b8a337eda7b9?w=200'}
                                                        alt={p.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#0d0e17] text-[13px] leading-tight mb-0.5 group-hover:text-[#c9a96e] transition-colors">{p.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-[11px] font-medium text-[#9999b0] flex items-center gap-1">
                                                            <Layers size={10} /> {p.items?.length || 0} biến thể
                                                        </p>
                                                        {(() => {
                                                            const availableCount = (p.items || []).filter(i => i.status === 'AVAILABLE').length;
                                                            const totalCount = (p.items || []).length;
                                                            if (totalCount === 0) return null;
                                                            if (availableCount === 0) {
                                                                return <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-50 text-red-600 uppercase tracking-wider border border-red-100">Hết hàng</span>;
                                                            } else if (availableCount <= 2) {
                                                                return <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-50 text-amber-600 uppercase tracking-wider border border-amber-100">Sắp hết ({availableCount})</span>;
                                                            }
                                                            return <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-wider border border-emerald-100">Sẵn sàng ({availableCount})</span>;
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 font-mono font-bold text-[#0d0e17] text-[12px]">{formatCurrency(p.basePrice)}</td>
                                        <td className="px-5 py-3 font-mono text-[12px]">
                                            {p.salePrice
                                                ? <span className="text-[#c9a96e] font-bold">{formatCurrency(p.salePrice)}</span>
                                                : <span className="text-[#c0c0d0]">—</span>}
                                        </td>
                                        <td className="px-5 py-3">
                                            {p.category?.name
                                                ? <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-bold bg-[#f4f4f8] text-[#6b6b80]">{p.category.name}</span>
                                                : <span className="text-[#c0c0d0]">—</span>}
                                        </td>
                                        <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                                            <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                                                {(p.items || []).slice(0, 3).map(item => (
                                                    <span key={item.id} className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold hover:scale-105 cursor-pointer transition-transform ${
                                                        SKU_STATUS_CONFIG[item.status]?.color || 'bg-gray-50 text-gray-400'
                                                    }`} title="Mở chi tiết SKU" onClick={() => openSkuDrawer(p)}>{item.sku}</span>
                                                ))}
                                                {(p.items || []).length > 3 && <span className="text-[10px] text-[#9999b0] font-bold bg-[#f4f4f8] px-1.5 py-0.5 rounded border border-[#e8e8f0] cursor-pointer" onClick={() => openSkuDrawer(p)}>+{p.items.length - 3}</span>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button onClick={() => openSkuDrawer(p)}
                                                    className="w-7 h-7 flex items-center justify-center text-[#9999b0] hover:text-[#0d0e17] hover:bg-[#f4f4f8] rounded-lg transition-colors" title="Quản lý Kho (SKU)">
                                                    <Tag size={14} />
                                                </button>
                                                <button onClick={() => openEditDrawer(p)}
                                                    className="w-7 h-7 flex items-center justify-center text-[#9999b0] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                                                    <PenBox size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(p.id, p.name)}
                                                    className="w-7 h-7 flex items-center justify-center text-[#9999b0] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                            {loading ? (
                                <div className="col-span-full py-16 text-center"><Loader2 className="animate-spin mx-auto text-[#c9a96e]" size={24} /></div>
                            ) : paginatedProducts.length === 0 ? (
                                <div className="col-span-full py-16 text-center text-[#9999b0] font-medium text-[13px]">Không tìm thấy sản phẩm nào</div>
                            ) : paginatedProducts.map(p => (
                                <div key={p.id} onClick={() => openEditDrawer(p)}
                                    className="bg-white border border-[#e8e8f0] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#c9a96e] transition-all duration-300 group flex flex-col cursor-pointer relative">
                                    {/* Image container */}
                                    <div className="h-64 bg-[#f8f8fc] relative overflow-hidden shrink-0">
                                        <img src={p.imageUrls?.[0] || 'https://images.unsplash.com/photo-1594552072238-b8a337eda7b9?w=300'}
                                            alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        
                                        {/* Category badge */}
                                        {p.category?.name && (
                                            <span className="absolute top-4 left-4 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-[#0d0e17] text-white tracking-widest">
                                                {p.category.name}
                                            </span>
                                        )}
                                        
                                        {/* Stock Status Badge */}
                                        <div className="absolute top-4 right-4">
                                            {(() => {
                                                const availableCount = (p.items || []).filter(i => i.status === 'AVAILABLE').length;
                                                const totalCount = (p.items || []).length;
                                                if (totalCount === 0) {
                                                    return <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-red-50 text-red-600 border border-red-200 shadow-sm uppercase">Hết hàng</span>;
                                                } else if (availableCount <= 2) {
                                                    return <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 shadow-sm uppercase animate-pulse">Sắp hết ({availableCount})</span>;
                                                }
                                                return <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm uppercase">Sẵn sàng ({availableCount})</span>;
                                            })()}
                                        </div>
                                    </div>
                                    
                                    {/* Details */}
                                    <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                                        <div>
                                            <h3 className="font-bold text-[#0d0e17] text-[13px] leading-snug group-hover:text-[#c9a96e] transition-colors mb-2 truncate">{p.name}</h3>
                                            <p className="text-[11px] text-[#9999b0] font-medium flex items-center gap-1 mb-4">
                                                <Package size={12} /> {p.items?.length || 0} biến thể đang quản lý
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-[#f4f4f8]">
                                            <div className="flex items-baseline gap-1.5">
                                                {p.salePrice ? (
                                                    <>
                                                        <span className="text-[13px] font-black text-[#c9a96e]">{formatCurrency(p.salePrice)}</span>
                                                        <span className="text-[10px] font-bold text-[#9999b0] line-through">{formatCurrency(p.basePrice)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-[13px] font-black text-[#0d0e17]">{formatCurrency(p.basePrice)}</span>
                                                )}
                                            </div>
                                            
                                            {/* Quick Actions for Grid Card */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => openSkuDrawer(p)}
                                                    className="w-7 h-7 flex items-center justify-center text-[#9999b0] hover:text-[#0d0e17] hover:bg-[#f4f4f8] rounded-lg transition-colors" title="Quản lý Kho (SKU)">
                                                    <Tag size={13} />
                                                </button>
                                                <button onClick={() => openEditDrawer(p)}
                                                    className="w-7 h-7 flex items-center justify-center text-[#9999b0] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                                                    <PenBox size={13} />
                                                </button>
                                                <button onClick={() => handleDelete(p.id, p.name)}
                                                    className="w-7 h-7 flex items-center justify-center text-[#9999b0] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                <div className="px-6 py-4 bg-[#f8f8fc] border-t border-[#e8e8f0] text-[11px] font-bold text-[#9999b0] uppercase tracking-wider flex justify-between items-center">
                    <div>Hiển thị <span className="text-[#0d0e17]">{filteredProducts.length}</span> sản phẩm</div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Sẵn sàng</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Đang thuê</div>
                    </div>
                </div>
            </div>

            {/* Product Detail/Edit Drawer */}
            {isDrawerOpen && createPortal(
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0b0c17]/60 backdrop-blur-sm p-4 transition-opacity" onClick={closeDrawer}>
                    <div className="bg-white w-full max-w-[900px] h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-8 py-6 border-b border-[#f4f4f8] shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-[#0d0e17]">
                                    {editingProduct ? 'Cập nhật Sản phẩm' : 'Thêm Sản Phẩm Mới'}
                                </h2>
                                <p className="text-[13px] font-bold text-[#c9a96e] mt-0.5 uppercase tracking-wider">THÔNG TIN CHI TIẾT</p>
                            </div>
                            <button onClick={closeDrawer} className="p-2.5 bg-[#f4f4f8] hover:bg-[#e8e8f0] rounded-full text-[#6b6b80] transition-colors shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto admin-scroll p-8 bg-[#f8f8fc] space-y-8">
                            {/* Images Section */}
                            <div className="bg-white rounded-3xl border border-[#e8e8f0] p-6 shadow-sm space-y-4">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Thư viện Ảnh</label>
                                
                                <div className="grid grid-cols-3 gap-3">
                                    {existingImageUrls.map((url, i) => (
                                        <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#e8e8f0] group">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeExistingUrl(url)}
                                                className="absolute top-2 right-2 w-7 h-7 bg-white/90 text-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                    {selectedFiles.map((sf, i) => (
                                        <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#c9a96e] group shadow-md">
                                            <img src={sf.preview} alt="" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeNewFile(i)}
                                                className="absolute top-2 right-2 w-7 h-7 bg-white/90 text-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                        className="aspect-[3/4] rounded-2xl border-2 border-dashed border-[#d0d0d0] flex flex-col items-center justify-center bg-[#f8f8fc] hover:bg-white hover:border-[#c9a96e] transition-all group">
                                        <UploadCloud size={24} className="text-[#9999b0] group-hover:text-[#c9a96e] transition-colors" />
                                        <span className="text-[11px] font-black uppercase mt-2 text-[#9999b0]">Thêm ảnh</span>
                                        <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                    </button>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="bg-white rounded-3xl border border-[#e8e8f0] p-6 shadow-sm space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Tên Sản Phẩm *</label>
                                    <input required type="text" value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#f8f8fc] border border-transparent rounded-2xl p-4 text-[14px] font-bold text-[#0d0e17] outline-none focus:border-[#c9a96e] focus:bg-white transition-all shadow-inner" />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Giá Niêm Yết (₫) *</label>
                                        <input required type="number" value={formData.basePrice}
                                            onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                                            className="w-full bg-[#f8f8fc] border border-transparent rounded-2xl p-4 text-[14px] font-bold text-[#0d0e17] outline-none focus:border-[#c9a96e] focus:bg-white transition-all shadow-inner" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Giá Khuyến Mãi (₫)</label>
                                        <input type="number" value={formData.salePrice}
                                            onChange={e => setFormData({ ...formData, salePrice: e.target.value })}
                                            className="w-full bg-[#f8f8fc] border border-transparent rounded-2xl p-4 text-[14px] font-bold text-[#c9a96e] outline-none focus:border-[#c9a96e] focus:bg-white transition-all shadow-inner" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Danh Mục</label>
                                    <div className="relative">
                                        <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full appearance-none bg-[#f8f8fc] border border-transparent rounded-2xl p-4 pr-10 text-[14px] font-bold text-[#0d0e17] outline-none focus:border-[#c9a96e] focus:bg-white transition-all shadow-inner">
                                            <option value="">-- Chọn danh mục --</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9999b0] pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Mô tả & Chất liệu</label>
                                    <textarea rows="5" value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Ví dụ: Lụa satin cao cấp, phong cách Hàn Quốc..."
                                        className="w-full bg-[#f8f8fc] border border-transparent rounded-2xl p-4 text-[14px] font-medium text-[#0d0e17] outline-none focus:border-[#c9a96e] focus:bg-white transition-all shadow-inner resize-none" />
                                </div>
                            </div>
                        </form>

                        <div className="px-8 py-6 border-t border-[#f4f4f8] bg-white flex gap-3 shrink-0">
                            <button onClick={closeDrawer}
                                className="flex-1 px-6 py-3.5 bg-[#f4f4f8] hover:bg-[#e8e8f0] text-[#0d0e17] rounded-2xl font-bold transition-all text-[13px]">
                                Hủy bỏ
                            </button>
                            <button onClick={handleSaveProduct} disabled={isSaving}
                                className="flex-[1.5] px-6 py-3.5 bg-[#0d0e17] hover:bg-black text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-black/20 text-[13px]">
                                {isSaving ? <Loader2 size={18} className="animate-spin text-[#c9a96e]" /> : <ShoppingBag size={18} />}
                                {isSaving ? 'Đang lưu...' : (editingProduct ? 'Cập Nhật Sản Phẩm' : 'Tạo Sản Phẩm Mới')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* SKU Management Drawer */}
            {isSkuDrawerOpen && selectedProductForSku && createPortal(
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0b0c17]/60 backdrop-blur-sm p-4 transition-opacity" onClick={closeSkuDrawer}>
                    <div className="bg-white w-full max-w-[650px] h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-8 py-6 border-b border-[#f4f4f8] shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-[#0d0e17]">Quản lý Kho lưu trữ</h2>
                                <p className="text-[13px] font-bold text-[#c9a96e] mt-0.5 uppercase tracking-wider">{selectedProductForSku.name}</p>
                            </div>
                            <button onClick={closeSkuDrawer} className="p-2.5 bg-[#f4f4f8] hover:bg-[#e8e8f0] rounded-full text-[#6b6b80] transition-colors shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto admin-scroll p-8 bg-[#f8f8fc] space-y-6">
                            {/* SKU Form */}
                            <form onSubmit={handleSaveSku} className="bg-white rounded-3xl border border-[#e8e8f0] p-6 shadow-sm space-y-5">
                                <div className="text-[11px] font-black uppercase tracking-widest text-[#9999b0] mb-2">{editingSku ? 'Chỉnh sửa SKU' : 'Thêm Biến thể (SKU)'}</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[#6b6b80] uppercase tracking-wider">Mã SKU *</label>
                                        <input required value={skuFormData.sku} onChange={e => setSkuFormData({...skuFormData, sku: e.target.value})}
                                            placeholder="VD: DRESS-001" className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[13px] font-black font-mono outline-none focus:border-[#c9a96e] focus:bg-white transition-all shadow-inner" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[#6b6b80] uppercase tracking-wider">Trạng thái</label>
                                        <div className="relative">
                                            <select value={skuFormData.status} onChange={e => setSkuFormData({...skuFormData, status: e.target.value})}
                                                className="w-full appearance-none bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[13px] font-black outline-none focus:border-[#c9a96e] focus:bg-white transition-all shadow-inner">
                                                {Object.entries(SKU_STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9999b0] pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[#6b6b80] uppercase tracking-wider">Kích cỡ (Size)</label>
                                        <input value={skuFormData.size} onChange={e => setSkuFormData({...skuFormData, size: e.target.value})}
                                            placeholder="S, M, L..." className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[13px] font-bold outline-none focus:border-[#c9a96e] focus:bg-white transition-all shadow-inner" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[#6b6b80] uppercase tracking-wider">Màu sắc</label>
                                        <input value={skuFormData.color} onChange={e => setSkuFormData({...skuFormData, color: e.target.value})}
                                            placeholder="Trắng, Đỏ..." className="w-full bg-[#f8f8fc] border border-transparent rounded-xl p-3 text-[13px] font-bold outline-none focus:border-[#c9a96e] focus:bg-white transition-all shadow-inner" />
                                    </div>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    {editingSku && (
                                        <button type="button" onClick={() => { setEditingSku(null); setSkuFormData(EMPTY_SKU_FORM); }}
                                            className="flex-1 py-3 bg-[#f4f4f8] text-[#0d0e17] rounded-xl font-bold text-[12px]">Hủy</button>
                                    )}
                                    <button type="submit" className="flex-[2] py-3 bg-[#0d0e17] text-white rounded-xl font-black text-[12px] shadow-lg shadow-black/10">
                                        {editingSku ? 'Cập Nhật SKU' : 'Xác Nhận Thêm SKU'}
                                    </button>
                                </div>
                            </form>

                            {/* SKU Table List */}
                            <div className="bg-white rounded-3xl border border-[#e8e8f0] shadow-sm overflow-hidden flex flex-col">
                                <div className="px-6 py-4 border-b border-[#f4f4f8] bg-[#f8f8fc] flex items-center justify-between">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#9999b0]">Danh sách tồn kho</span>
                                    <span className="px-2.5 py-1 bg-white border border-[#e8e8f0] rounded-lg text-[10px] font-black text-[#0d0e17]">{selectedProductForSku.items?.length || 0} SKU</span>
                                </div>
                                <div className="overflow-x-auto admin-scroll">
                                    <table className="w-full text-left text-[13px]">
                                        <thead className="bg-white text-[10px] font-black uppercase text-[#9999b0] border-b border-[#f4f4f8]">
                                            <tr>
                                                <th className="px-6 py-3">Mã SKU</th>
                                                <th className="px-6 py-3">Size/Màu</th>
                                                <th className="px-6 py-3">Tình trạng</th>
                                                <th className="px-6 py-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#f4f4f8]">
                                            {selectedProductForSku.items?.map(item => (
                                                <tr key={item.id} className="hover:bg-[#fafafa] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-mono font-black text-[#0d0e17]">{item.sku}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-[12px] font-bold text-[#6b6b80]">{item.size || '—'} / {item.color || '—'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black ${SKU_STATUS_CONFIG[item.status]?.color}`}>
                                                            <span className="w-1 h-1 rounded-full" style={{ background: SKU_STATUS_CONFIG[item.status]?.dot }} />
                                                            {SKU_STATUS_CONFIG[item.status]?.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button onClick={() => { setEditingSku(item); setSkuFormData({ sku: item.sku, size: item.size || '', color: item.color || '', status: item.status }); }}
                                                                className="p-1.5 text-[#9999b0] hover:text-blue-600 transition-colors"><PenBox size={14} /></button>
                                                            <button onClick={() => handleDeleteSku(item.id)}
                                                                className="p-1.5 text-[#9999b0] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-[#f4f4f8] bg-white shrink-0">
                            <button onClick={closeSkuDrawer}
                                className="w-full px-6 py-3.5 bg-[#0d0e17] text-white rounded-2xl font-black transition-all text-[13px] shadow-lg shadow-black/20">
                                Hoàn tất & Lưu kho
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ManageProducts;
