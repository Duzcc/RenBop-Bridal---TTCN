import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterSidebar = ({ isOpen, onClose, onApply, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState(currentFilters || {
        categories: [],
        size: [],
        maxPrice: 30000000 // Luxury default max
    });

    const categories = [
        { id: '2025', label: 'Collection 2025' },
        { id: '2024', label: 'Collection 2024' },
        { id: 'vay-cuoi', label: 'Bridal Gowns' },
        { id: 'ao-dai', label: 'Ao Dai Couture' },
        { id: 'phu-kien', label: 'Accessories' }
    ];

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'Custom'];

    const handleCategoryChange = (catId) => {
        setLocalFilters(prev => {
            const isSelected = prev.categories.includes(catId);
            return {
                ...prev,
                categories: isSelected
                    ? prev.categories.filter(c => c !== catId)
                    : [...prev.categories, catId]
            };
        });
    };

    const handleSizeChange = (size) => {
        setLocalFilters(prev => {
            const isSelected = prev.size.includes(size);
            return {
                ...prev,
                size: isSelected
                    ? prev.size.filter(s => s !== size)
                    : [...prev.size, size]
            };
        });
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
        const defaultFilters = { categories: [], size: [], maxPrice: 50000000 };
        setLocalFilters(defaultFilters);
        onApply(defaultFilters);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-[60] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed top-0 right-0 bottom-0 w-[400px] max-w-full bg-ivory z-[70] shadow-2xl flex flex-col border-l border-white/50"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-8 border-b border-gray-200">
                            <span className="font-serif text-2xl text-charcoal italic">Filter Products</span>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-60 hover:opacity-100"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto px-8 py-6 space-y-10 custom-scrollbar">
                            {/* Categories */}
                            <div>
                                <h3 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-champagne mb-6">Discovery</h3>
                                <div className="space-y-4">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center group cursor-pointer">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={localFilters.categories.includes(cat.id)}
                                                    onChange={() => handleCategoryChange(cat.id)}
                                                    className="peer appearance-none w-5 h-5 border border-charcoal/30 rounded-sm checked:bg-charcoal transition-colors"
                                                />
                                                <Check size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                            </div>
                                            <span className="ml-4 font-serif text-lg text-charcoal group-hover:text-champagne transition-colors">
                                                {cat.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Slider */}
                            <div>
                                <h3 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-champagne mb-6">Price Range</h3>
                                <div className="px-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="50000000"
                                        step="1000000"
                                        value={localFilters.maxPrice}
                                        onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: parseInt(e.target.value) })}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-champagne"
                                    />
                                    <div className="flex justify-between mt-4 font-sans text-sm text-charcoal">
                                        <span>0 VND</span>
                                        <span className="font-medium text-champagne">{localFilters.maxPrice.toLocaleString()} VND</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sizes */}
                            <div>
                                <h3 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-champagne mb-6">Size</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => handleSizeChange(size)}
                                            className={`py-3 text-sm font-sans transition-all duration-300 ${localFilters.size.includes(size)
                                                    ? 'bg-charcoal text-white shadow-lg'
                                                    : 'bg-white border border-gray-200 text-charcoal hover:border-champagne hover:text-champagne'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 border-t border-gray-200 bg-ivory-dark/50 space-y-3">
                            <button
                                onClick={handleApply}
                                className="w-full py-4 bg-champagne text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-champagne-dark hover:shadow-lg transition-all"
                            >
                                Show Results
                            </button>
                            <button
                                onClick={handleClear}
                                className="w-full py-3 text-charcoal font-sans text-xs hover:text-champagne transition-colors underline underline-offset-4 decoration-gray-300"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FilterSidebar;
