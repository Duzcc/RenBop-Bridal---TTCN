import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X, CheckCircle } from 'lucide-react';

const FloatingActionBar = ({ 
    selectedCount, 
    onClearSelection, 
    onBulkDelete, 
    onBulkStatusChange,
    statusOptions = []
}) => {
    if (selectedCount === 0) return null;

    return createPortal(
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-4 bg-[#0d0e17] text-white px-6 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                <div className="w-6 h-6 rounded-full bg-[#c9a96e] text-[#0d0e17] flex items-center justify-center text-[12px] font-black">
                    {selectedCount}
                </div>
                <span className="text-[13px] font-medium tracking-wide">đã chọn</span>
            </div>
            
            <div className="flex items-center gap-2">
                {statusOptions.length > 0 && (
                    <div className="relative group">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold hover:bg-white/10 transition-colors">
                            <CheckCircle size={14} className="text-[#c9a96e]" /> Cập nhật
                        </button>
                        {/* Dropdown status (CSS hover based for simplicity) */}
                        <div className="absolute bottom-full left-0 mb-2 w-40 bg-white text-[#0d0e17] rounded-xl shadow-xl border border-[#e8e8f0] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 overflow-hidden">
                            {statusOptions.map(opt => (
                                <button key={opt.value} onClick={() => onBulkStatusChange && onBulkStatusChange(opt.value)}
                                    className="w-full text-left px-4 py-2 text-[12px] font-bold hover:bg-[#f8f8fc] transition-colors">
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {onBulkDelete && (
                    <button onClick={onBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 size={14} /> Xóa
                    </button>
                )}
            </div>

            <button onClick={onClearSelection} className="ml-2 p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors" title="Bỏ chọn">
                <X size={16} />
            </button>
        </div>,
        document.body
    );
};

export default FloatingActionBar;
