import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="relative h-[calc(100vh-80px)] w-full overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1546193430-c2d207739ed7?q=80&w=2696&auto=format&fit=crop")',
                    backgroundPosition: 'top center'
                }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h2 className="text-sm md:text-base tracking-[0.3em] uppercase mb-4">New Collection</h2>
                    <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-8">
                        ETHEREAL DREAMS
                    </h1>
                    <Link
                        to="/collections/2025"
                        className="inline-block bg-white text-black px-8 py-3 text-sm tracking-wider uppercase hover:bg-black hover:text-white transition-colors duration-300"
                    >
                        Explore Collection
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
