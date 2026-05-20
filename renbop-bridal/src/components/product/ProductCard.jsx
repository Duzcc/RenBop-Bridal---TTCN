import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Fallback if no images are provided
    const mainImage = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://images.unsplash.com/photo-1594552072238-b8a337eda7b9?w=800';
    const secondaryImage = product.imageUrls && product.imageUrls.length > 1 ? product.imageUrls[1] : mainImage;

    return (
        <div
            className="group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/products/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                {/* Main Image */}
                <img
                    src={mainImage}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                />

                {/* Secondary Image (Swap) */}
                <img
                    src={secondaryImage}
                    alt={`${product.name} - Back View`}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
                />

                {/* Badges */}
                {product.isNew && (
                    <span className="absolute top-3 left-3 bg-white/90 text-[10px] font-bold tracking-widest uppercase px-3 py-1 text-charcoal backdrop-blur-sm">
                        New In
                    </span>
                )}

                {/* Quick Action Buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <button className="p-2 bg-white/90 backdrop-blur-md rounded-full text-charcoal hover:bg-champagne hover:text-white transition-colors" title="Add to Wishlist">
                        <Heart size={18} />
                    </button>
                    <button className="p-2 bg-white/90 backdrop-blur-md rounded-full text-charcoal hover:bg-champagne hover:text-white transition-colors" title="Quick View">
                        <Maximize2 size={18} />
                    </button>
                </div>

                {/* Quick Add Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <button className="w-full py-3 bg-white/95 backdrop-blur-md text-charcoal text-xs font-bold uppercase tracking-widest hover:bg-champagne hover:text-white transition-colors shadow-lg">
                        Quick Add
                    </button>
                </div>
            </Link>

            {/* Product Info */}
            <div className="text-center">
                <Link to={`/products/${product.id}`}>
                    <h3 className="font-serif text-lg text-charcoal group-hover:text-champagne transition-colors duration-300 cursor-pointer">
                        {product.name}
                    </h3>
                </Link>
                <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="font-sans text-sm text-champagne font-medium tracking-wide">
                        {(product.salePrice || product.price || product.basePrice || 0).toLocaleString()} VND
                    </span>
                    {product.salePrice && (
                        <span className="font-sans text-xs text-gray-400 line-through">
                            {(product.price || product.basePrice || 0).toLocaleString()} VND
                        </span>
                    )}
                </div>

                {/* Available colors (Optional) */}
                <div className="mt-2 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-3 h-3 rounded-full bg-ivory border border-gray-300" title="Ivory"></div>
                    <div className="w-3 h-3 rounded-full bg-white border border-gray-300" title="White"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
