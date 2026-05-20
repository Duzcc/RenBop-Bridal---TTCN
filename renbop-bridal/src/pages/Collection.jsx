import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/product/FilterSidebar';
import { apiClient } from '../utils/apiClient';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Collection = () => {
    const { slug } = useParams();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        categories: [],
        size: [],
        maxPrice: 50000000
    });
    const [sortOption, setSortOption] = useState('featured');

    const decodedSlug = decodeURIComponent(slug || '');
    let minPriceLimit = 0;
    let maxPriceLimit = Infinity;
    let isPriceRange = false;
    let priceTitle = '';

    if (decodedSlug.includes('1-5tr')) {
        minPriceLimit = 1000000;
        maxPriceLimit = 5000000;
        isPriceRange = true;
        priceTitle = 'Renbop Collection (1-5TR)';
    } else if (decodedSlug.includes('5-7tr')) {
        minPriceLimit = 5000000;
        maxPriceLimit = 7000000;
        isPriceRange = true;
        priceTitle = 'Renroy Collection (5-7TR)';
    } else if (decodedSlug.includes('8-12tr')) {
        minPriceLimit = 8000000;
        maxPriceLimit = 12000000;
        isPriceRange = true;
        priceTitle = 'Royyal Collection (8-12TR)';
    } else if (decodedSlug.includes('12-30tr')) {
        minPriceLimit = 12000000;
        maxPriceLimit = 30000000;
        isPriceRange = true;
        priceTitle = 'Luxury Collection (12-30TR)';
    }

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const params = new URLSearchParams();
                
                // 1. Phân loại theo categorySlug nếu không phải bộ sưu tập theo giá
                if (slug && slug !== 'all' && !isPriceRange) {
                    let catSlug = slug;
                    if (slug === 'vay-cuoi' || slug === 'ao-cuoi') catSlug = 'vay-cuoi-cao-cap';
                    if (slug === 'ao-dai') catSlug = 'ao-dai-cuoi';
                    params.append('categorySlug', catSlug);
                }

                // 2. Sắp xếp
                if (sortOption === 'price-asc') {
                    params.append('sortBy', 'price');
                    params.append('sortDir', 'asc');
                } else if (sortOption === 'price-desc') {
                    params.append('sortBy', 'price');
                    params.append('sortDir', 'desc');
                } else if (sortOption === 'newest') {
                    params.append('sortBy', 'createdAt');
                    params.append('sortDir', 'desc');
                } else if (sortOption === 'featured') {
                    params.append('featured', 'true');
                }

                // Lấy lượng sản phẩm lớn để có thể lọc giá đầy đủ ở client-side
                params.append('size', '200');

                const response = await apiClient(`/products?${params.toString()}`);
                
                if (response.success && response.data) {
                    let result = response.data.content || [];
                    
                    // Lọc theo bộ sưu tập giá (1-5tr, 5-7tr, v.v...)
                    if (isPriceRange) {
                        result = result.filter(p => {
                            const pPrice = p.salePrice || p.price || p.basePrice || 0;
                            return pPrice >= minPriceLimit && pPrice <= maxPriceLimit;
                        });
                    }

                    // Client-side Lọc danh mục phụ từ bộ lọc Sidebar
                    if (filters.categories.length > 0) {
                        result = result.filter(p => p.category && filters.categories.includes(p.category.slug));
                    }
                    
                    // Lọc giá tối đa từ bộ lọc Sidebar
                    if (filters.maxPrice < 50000000) {
                        result = result.filter(p => {
                            const pPrice = p.salePrice || p.price || p.basePrice || 0;
                            return pPrice <= filters.maxPrice;
                        });
                    }
                     
                    setFilteredProducts(result);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setFilteredProducts([]);
            }
        };

        fetchProducts();
    }, [slug, sortOption, filters, isPriceRange, minPriceLimit, maxPriceLimit]);

    const getTitle = () => {
        if (isPriceRange) return priceTitle;
        // Map slug to display title
        const titles = {
            '2025': 'Collection 2025',
            '2024': 'Collection 2024',
            'vay-cuoi-cao-cap': 'Váy Cưới Cao Cấp',
            'vay-cuoi': 'Váy Cưới Cao Cấp',
            'ao-cuoi': 'Váy Cưới Cao Cấp',
            'ao-dai-cuoi': 'Áo Dài Cưới',
            'ao-dai': 'Áo Dài Cưới',
            'vest-chu-re': 'Vest Chú Rể',
            'phu-kien-cuoi': 'Phụ Kiện Cưới'
        };
        return titles[slug] || 'All Collections';
    };

    return (
        <div className="min-h-screen bg-ivory pt-12 pb-24">
            {/* Filter Sidebar */}
            <FilterSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={setFilters}
                currentFilters={filters}
            />

            <div className="container-luxury">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="font-sans text-xs font-bold tracking-[0.2em] text-champagne uppercase mb-4 block">
                        Renbop Bridal
                    </span>
                    <h1 className="font-serif text-4xl md:text-5xl text-charcoal">{getTitle()}</h1>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-charcoal/10 gap-4">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-3 font-sans text-xs font-bold uppercase tracking-widest text-charcoal hover:text-champagne transition-colors"
                    >
                        <SlidersHorizontal size={16} />
                        Filter & Sort
                    </button>

                    <div className="flex items-center gap-6">
                        <p className="font-sans text-xs text-gray-500 tracking-wide">
                            {filteredProducts.length} Products
                        </p>
                        <div className="relative group">
                            <button className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-widest text-charcoal">
                                Sort By <ChevronDown size={14} />
                            </button>
                            {/* Dropdown would go here - simplified for now */}
                            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
                                <div className="bg-white shadow-xl border border-gray-100 p-2 min-w-[160px] flex flex-col gap-1">
                                    <button onClick={() => setSortOption('featured')} className="text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black">Featured</button>
                                    <button onClick={() => setSortOption('newest')} className="text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black">Newest</button>
                                    <button onClick={() => setSortOption('price-asc')} className="text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black">Price: Low to High</button>
                                    <button onClick={() => setSortOption('price-desc')} className="text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black">Price: High to Low</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                {filteredProducts.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12"
                    >
                        {filteredProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.05 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center text-gray-400">
                        <p className="font-serif text-2xl italic mb-4">No treasures found.</p>
                        <button
                            onClick={() => {
                                setFilters({ categories: [], size: [], maxPrice: 50000000 });
                                setSortOption('featured');
                            }}
                            className="text-xs font-bold uppercase tracking-widest border-b border-charcoal pb-1"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Collection;
