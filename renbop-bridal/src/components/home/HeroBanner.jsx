import React from 'react';
import { Link } from 'react-router-dom';

const HeroBanner = () => {
    return (
        <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
            <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop"
                alt="BST 2025"
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-12">
                <Link
                    to="/collections/2025"
                    className="bg-white/90 backdrop-blur-sm px-8 py-3 text-sm font-medium tracking-wide hover:bg-white transition-colors flex items-center gap-2"
                >
                    #renbopcollection2025
                    <span className="text-xs opacity-60">@ nhiều màu</span>
                </Link>
            </div>
        </div>
    );
};

export default HeroBanner;
