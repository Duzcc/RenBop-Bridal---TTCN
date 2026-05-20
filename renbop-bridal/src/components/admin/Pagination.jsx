import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-[#e8e8f0]">
            <div className="text-[12px] font-medium text-[#9999b0]">
                Trang <span className="font-bold text-[#0d0e17]">{currentPage}</span> / {totalPages}
            </div>
            
            <div className="flex items-center gap-1.5">
                <button 
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e8e8f0] text-[#6b6b80] hover:border-[#c9a96e] hover:text-[#c9a96e] disabled:opacity-50 disabled:hover:border-[#e8e8f0] disabled:hover:text-[#6b6b80] transition-all bg-white shadow-sm"
                >
                    <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <div className="w-8 h-8 flex items-center justify-center text-[#9999b0]">
                                <MoreHorizontal size={14} />
                            </div>
                        ) : (
                            <button
                                onClick={() => onPageChange(page)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold transition-all shadow-sm ${
                                    currentPage === page 
                                        ? 'bg-[#c9a96e] text-white border-transparent' 
                                        : 'bg-white border border-[#e8e8f0] text-[#6b6b80] hover:border-[#c9a96e] hover:text-[#c9a96e]'
                                }`}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                <button 
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e8e8f0] text-[#6b6b80] hover:border-[#c9a96e] hover:text-[#c9a96e] disabled:opacity-50 disabled:hover:border-[#e8e8f0] disabled:hover:text-[#6b6b80] transition-all bg-white shadow-sm"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
