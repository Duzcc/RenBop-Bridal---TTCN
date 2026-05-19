import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Users, Package, Calendar, Settings, FileText, CornerDownLeft, Plus, Zap } from 'lucide-react';

const CommandPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const commands = [
        { type: 'NAV', id: 'dashboard', icon: <Calendar size={16} />, label: 'Tổng quan (Dashboard)', path: '/admin/dashboard' },
        { type: 'NAV', id: 'orders', icon: <ShoppingBag size={16} />, label: 'Quản lý Đơn Hàng', path: '/admin/orders' },
        { type: 'NAV', id: 'customers', icon: <Users size={16} />, label: 'Quản lý Khách Hàng', path: '/admin/users' },
        { type: 'NAV', id: 'products', icon: <Package size={16} />, label: 'Quản lý Sản Phẩm', path: '/admin/products' },
        { type: 'NAV', id: 'tailoring', icon: <Package size={16} />, label: 'Quản lý May Đo', path: '/admin/tailoring-orders' },
        
        { type: 'ACTION', id: 'new_order', icon: <Plus size={16} />, label: 'Tạo đơn hàng mới', path: '/admin/orders?action=create' },
        { type: 'ACTION', id: 'new_customer', icon: <Plus size={16} />, label: 'Thêm khách hàng', path: '/admin/users?action=create' },
        { type: 'ACTION', id: 'new_product', icon: <Plus size={16} />, label: 'Thêm sản phẩm mới', path: '/admin/products?action=create' },
    ];

    const filteredCommands = commands.filter(cmd => 
        cmd.label.toLowerCase().includes(query.toLowerCase()) || 
        cmd.id.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = filteredCommands[selectedIndex];
                if (cmd) {
                    handleSelect(cmd);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, onClose]);

    const handleSelect = (cmd) => {
        navigate(cmd.path);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 font-sans" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#0d0e17]/40 backdrop-blur-sm" />
            
            {/* Modal */}
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Search Input */}
                <div className="flex items-center px-4 py-4 border-b border-[#f4f4f8]">
                    <Search size={20} className="text-[#9999b0]" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tìm kiếm hoặc điều hướng..." 
                        className="w-full pl-3 pr-4 py-1 text-base bg-transparent border-none outline-none text-[#0d0e17] placeholder-[#9999b0]"
                    />
                    <div className="flex items-center gap-1">
                        <kbd className="px-2 py-1 text-[10px] font-bold font-mono text-[#9999b0] bg-[#f4f4f8] rounded border border-[#e8e8f0]">ESC</kbd>
                    </div>
                </div>

                {/* Results List */}
                <div className="max-h-[60vh] overflow-y-auto p-2 admin-scroll">
                    {filteredCommands.length > 0 ? (
                        <div className="space-y-1">
                            {filteredCommands.map((cmd, idx) => (
                                <button 
                                    key={cmd.id}
                                    onClick={() => handleSelect(cmd)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                                        selectedIndex === idx 
                                            ? 'bg-[#c9a96e] text-white shadow-md' 
                                            : 'text-[#6b6b80] hover:bg-[#f8f8fc] hover:text-[#0d0e17]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${selectedIndex === idx ? 'bg-white/20 text-white' : 'bg-[#f4f4f8] text-[#9999b0]'}`}>
                                            {cmd.icon}
                                        </div>
                                        <span className="font-bold">{cmd.label}</span>
                                        {cmd.type === 'ACTION' && (
                                            <span className={`ml-2 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded ${selectedIndex === idx ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                                                Action
                                            </span>
                                        )}
                                    </div>
                                    {selectedIndex === idx && (
                                        <div className="flex items-center opacity-70">
                                            <CornerDownLeft size={16} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-12 text-center text-[#9999b0]">
                            <p className="font-medium text-sm">Không tìm thấy kết quả nào cho "{query}"</p>
                            <p className="text-[12px] mt-1">Vui lòng thử từ khóa khác</p>
                        </div>
                    )}
                </div>

                {/* Footer hints */}
                <div className="flex items-center px-4 py-3 border-t border-[#f4f4f8] bg-[#f8f8fc] text-[11px] font-bold text-[#9999b0] gap-4">
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded border border-[#e8e8f0] bg-white">↑↓</kbd> 
                        <span>Điều hướng</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded border border-[#e8e8f0] bg-white">↵</kbd> 
                        <span>Chọn</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
