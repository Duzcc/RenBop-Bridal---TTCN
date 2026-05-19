import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageGallery = ({ images = [] }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // If no images prop, mock some data or handle gracefully
    const allImages = images.length > 0 ? images : ['https://via.placeholder.com/600x800'];

    const handleNext = () => {
        setSelectedIndex((prev) => (prev + 1) % allImages.length);
    };

    const handlePrev = () => {
        setSelectedIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 group">
                <AnimatePresence mode='wait'>
                    <motion.img
                        key={selectedIndex}
                        src={allImages[selectedIndex]}
                        alt={`Product image ${selectedIndex + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-cover"
                    />
                </AnimatePresence>

                {/* Arrows */}
                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                    {allImages.map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={`aspect-[3/4] bg-gray-100 cursor-pointer overflow-hidden relative ${selectedIndex === idx ? 'ring-2 ring-black' : 'hover:opacity-80'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className={`w-full h-full object-cover transition-opacity ${selectedIndex === idx ? 'opacity-100' : 'opacity-60'}`}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
