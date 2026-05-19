import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const CollectionSection = ({ title, subtitle, priceRange, link, images }) => {
    return (
        <div className="py-12">
            <div className="max-w-md mx-auto mb-6 text-center">
                {subtitle && (
                    <div className="inline-block border border-primary rounded-full px-6 py-1 text-xs uppercase tracking-widest mb-4">
                        {subtitle}
                    </div>
                )}
                <h2 className="font-serif text-4xl md:text-5xl mb-6">{title}</h2>

                {/* Price Range Search */}
                <div className="flex items-center justify-center gap-2 bg-white rounded-full border border-gray-300 px-4 py-2 max-w-sm mx-auto">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder={priceRange}
                        className="flex-grow bg-transparent text-sm focus:outline-none text-center"
                        readOnly
                    />
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto px-4">
                {images.map((img, idx) => (
                    <Link
                        key={idx}
                        to={link}
                        className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 hover:opacity-90 transition-opacity"
                    >
                        <img
                            src={img}
                            alt={`${title} ${idx + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </Link>
                ))}
            </div>

            <div className="text-center mt-6">
                <Link
                    to={link}
                    className="inline-block text-sm font-medium hover:underline"
                >
                    {title} →
                </Link>
            </div>
        </div>
    );
};

export default CollectionSection;
