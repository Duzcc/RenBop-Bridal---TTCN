import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const AsymmetricGallery = () => {
    const images = [
        'https://images.unsplash.com/photo-1594552072238-a2ea1cc37e0?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=400&h=500&fit=crop',
    ];

    return (
        <div className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-12 gap-4">
                    {/* Large main image - left */}
                    <div className="col-span-12 md:col-span-5 row-span-2">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                            <img
                                src={images[0]}
                                alt="ROLYAL DRESS main"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Right side - floating images and text */}
                    <div className="col-span-12 md:col-span-7 space-y-4">
                        {/* Top small images */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                                <img src={images[1]} alt="Detail 1" className="w-full h-full object-cover" />
                            </div>
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                                <img src={images[2]} alt="Detail 2" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        {/* Title and price */}
                        <div className="text-right py-4">
                            <h2 className="font-serif text-4xl md:text-5xl mb-4">ROLYAL DRESS</h2>
                            <div className="inline-flex items-center gap-2 bg-white rounded-full border border-gray-300 px-4 py-2">
                                <Search size={16} className="text-gray-400" />
                                <span className="text-sm">8.000.000đ tới 13.000.000đ</span>
                            </div>
                        </div>

                        {/* Bottom small images */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                                <img src={images[3]} alt="Detail 3" className="w-full h-full object-cover" />
                            </div>
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                                <img src={images[4]} alt="Detail 4" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <Link
                        to="/collections/rolyal-dress"
                        className="inline-block text-sm font-medium hover:underline"
                    >
                        BST ROXYALABC ROYAL 8Tr - 13Tr →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AsymmetricGallery;
