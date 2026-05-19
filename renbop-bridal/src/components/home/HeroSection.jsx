import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const HeroSection = () => {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 150]); // Parallax effect

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Video Background */}
            <motion.div
                style={{ y }}
                className="absolute inset-0 w-full h-full"
            >
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    poster="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-walking-in-nature-4381-large.mp4" type="video/mp4" />
                </video>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40"></div>
            </motion.div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="font-serif text-5xl md:text-7xl text-center mb-6 tracking-wide"
                >
                    Your Dream, Redefined
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="text-lg md:text-xl text-center mb-10 max-w-2xl font-light tracking-wide"
                >
                    Discover elegance in every stitch. Your perfect moment begins here.
                </motion.p>

                <motion.button
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="bg-white text-black px-10 py-4 text-sm uppercase tracking-widest font-bold hover:bg-accent-green hover:text-white transition-colors duration-300"
                >
                    Schedule Consultation
                </motion.button>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.5 }}
                    className="absolute bottom-10 animate-bounce"
                >
                    <ChevronDown size={32} />
                </motion.div>
            </div>
        </div>
    );
};

export default HeroSection;
