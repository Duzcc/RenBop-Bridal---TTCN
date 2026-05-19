import React from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Link } from 'react-router-dom';

const BrandPhilosophy = () => {
    const [imageRef, imageVisible] = useScrollReveal(0.2);
    const [textRef, textVisible] = useScrollReveal(0.2);

    return (
        <section className="section-padding bg-ivory overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-champagne/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="container-luxury relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-28">
                    {/* Image Side */}
                    <motion.div
                        ref={imageRef}
                        initial={{ opacity: 0, y: 50 }}
                        animate={imageVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full lg:w-1/2 relative group"
                    >
                        <div className="relative aspect-[3/4] overflow-hidden max-w-md mx-auto lg:mx-0">
                            <motion.img
                                src="https://images.unsplash.com/photo-1549416878-b9727523c556?q=80&w=2670&auto=format&fit=crop"
                                alt="Renbop Philosophy"
                                className="w-full h-full object-cover object-center transition-transform duration-[2s] ease-out group-hover:scale-105"
                            />
                            {/* Decorative Frame */}
                            <div className="absolute inset-4 border border-white/40 pointer-events-none" />
                        </div>
                        {/* Floating Element */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={imageVisible ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="absolute -bottom-8 -right-4 lg:-right-12 w-40 h-40 lg:w-56 lg:h-56 bg-ivory p-3 shadow-2xl z-10"
                        >
                            <div className="w-full h-full border border-champagne/40 flex flex-col items-center justify-center p-4 text-center bg-white/50 backdrop-blur-sm">
                                <span className="font-serif text-2xl lg:text-3xl italic text-charcoal leading-tight">
                                    Timeless<br />Beauty
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Text Side */}
                    <motion.div
                        ref={textRef}
                        initial={{ opacity: 0, y: 30 }}
                        animate={textVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="w-full lg:w-1/2 text-center lg:text-left pt-8 lg:pt-0"
                    >
                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                            <div className="w-8 h-[1px] bg-champagne" />
                            <span className="font-sans text-[10px] md:text-xs font-bold tracking-[0.25em] text-champagne uppercase">
                                Our Philosophy
                            </span>
                        </div>
                        
                        <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl text-charcoal mb-8 leading-[1.15]">
                            Every Stitch Tells <br />
                            <span className="italic text-champagne-dark font-light">A Unique Story</span>
                        </h2>
                        
                        <div className="font-sans text-charcoal-light/80 text-sm md:text-base space-y-6 leading-[1.8] mb-12 max-w-lg mx-auto lg:mx-0">
                            <p>
                                At Renbop Bridal, we believe that your wedding dress is more than just a garment—it is a tangible memory, a piece of art that embodies your love story.
                            </p>
                            <p>
                                Since 2010, our atelier has been dedicated to blending traditional craftsmanship with contemporary aesthetics. Each gown is meticulously designed to celebrate the feminine form, using only the finest silk, lace, and tulle sourced from around the globe.
                            </p>
                        </div>
                        
                        <Link
                            to="/pages/contact"
                            className="btn-ghost group inline-flex items-center gap-2"
                        >
                            <span>Discover Our Story</span>
                            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default BrandPhilosophy;
