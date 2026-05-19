import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import { fadeInUp } from '../../utils/animations';

const HeroLuxury = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);

    return (
        <section className="relative h-screen min-h-[800px] w-full overflow-hidden bg-charcoal">
            {/* Background Image with Parallax */}
            <motion.div 
                style={{ y: y1 }}
                className="absolute inset-0 w-full h-full"
            >
                <div className="absolute inset-0 bg-black/30 z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=2574&auto=format&fit=crop"
                    alt="Elegant Bride in Renbop Gown"
                    className="w-full h-full object-cover object-[center_20%]"
                />
            </motion.div>

            {/* Content Container */}
            <div className="relative z-20 container-luxury h-full flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    className="max-w-2xl"
                >
                    <span className="block font-sans text-xs md:text-sm font-bold tracking-[0.3em] text-champagne uppercase mb-6 drop-shadow-md">
                        Est. 2010 • The Bridal Atelier
                    </span>

                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-ivory leading-[1.1] mb-8 drop-shadow-lg">
                        The Art of <br />
                        <span className="italic font-light text-champagne-light">Elegance</span>
                    </h1>

                    <p className="font-sans text-ivory-dark/90 text-sm md:text-base lg:text-lg leading-relaxed mb-12 max-w-md mx-auto lg:mx-0 drop-shadow-md">
                        Crafting unforgettable moments with exquisite designs tailored for the modern, sophisticated bride. Where every stitch tells your unique love story.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                        <Link
                            to="/collections/all"
                            className="btn-primary"
                        >
                            Explore Collections
                        </Link>
                        <Link
                            to="/pages/contact"
                            className="btn-secondary !text-ivory !border-ivory hover:!bg-ivory hover:!text-charcoal"
                        >
                            Book Appointment
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                style={{ opacity }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 15, 0] }}
                transition={{
                    opacity: { delay: 1.5, duration: 1 },
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer z-20 group"
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
                <span className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-ivory/70 group-hover:text-champagne transition-colors duration-300">
                    Discover
                </span>
                <div className="w-[1px] h-12 bg-ivory/30 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-champagne animate-[scrollLine_2s_ease-in-out_infinite]" />
                </div>
            </motion.div>
        </section>
    );
};

export default HeroLuxury;
