import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const Feedback = () => {
    // Mock customer feedback images
    const feedbackImages = [
        { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop', name: 'Sophia & James', quote: 'A dream come true.' },
        { src: 'https://images.unsplash.com/photo-1594552072238-a2ea1cc37e0?w=800&h=1200&fit=crop', name: 'Emily T.', quote: 'Felt like a queen.' },
        { src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=1000&fit=crop', name: 'Linh Nguyen', quote: 'Perfect fit, perfect day.' },
        { src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&h=1000&fit=crop', name: 'Sarah M.', quote: 'The details are incredible.' },
        { src: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=800&h=1200&fit=crop', name: 'Jessica', quote: 'Stunning craftsmanship.' },
        { src: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&h=1000&fit=crop', name: 'Hannah & David', quote: 'Thank you Renbop!' },
        { src: 'https://images.unsplash.com/photo-1591604466526-e5b29f5c8e17?w=800&h=1000&fit=crop', name: 'Mai Anh', quote: 'Elegant and timeless.' },
        { src: 'https://images.unsplash.com/photo-1543622776-175a4b011f9c?w=800&h=1200&fit=crop', name: 'Olivia', quote: 'Highly recommended.' },
        { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop', name: 'Grace', quote: 'Everything I wanted.' },
    ];

    return (
        <div className="min-h-screen bg-ivory pt-32 pb-24">
            <div className="container-luxury">
                <div className="text-center mb-20">
                    <span className="font-sans text-xs font-bold tracking-[0.2em] text-champagne uppercase mb-4 block">
                        Love Stories
                    </span>
                    <h1 className="font-serif text-5xl md:text-6xl text-charcoal italic mb-6">Real Brides</h1>
                    <p className="text-gray-500 max-w-xl mx-auto font-sans leading-relaxed">
                        Nothing makes us happier than seeing our brides shine. Here are some beautiful moments captured from real weddings around the world.
                    </p>
                </div>

                {/* Masonry Grid Simulation (using standard grid with varied aspect ratios or just columns) */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {feedbackImages.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="break-inside-avoid"
                        >
                            <div className="relative group overflow-hidden bg-gray-100">
                                <img
                                    src={item.src}
                                    alt={`Real Bride ${item.name}`}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-white">
                                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="flex items-center gap-2 text-champagne mb-2">
                                            <Heart size={16} fill="currentColor" />
                                        </div>
                                        <p className="font-serif text-xl italic mb-1">"{item.quote}"</p>
                                        <p className="font-sans text-xs font-bold uppercase tracking-widest opacity-80">— {item.name}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-24">
                    <button className="inline-block border-b border-charcoal text-charcoal pb-1 uppercase tracking-widest text-xs font-bold hover:text-champagne hover:border-champagne transition-all">
                        Load More Stories
                    </button>
                    <p className="mt-8 text-xs text-gray-400">
                        Want to be featured? Tag us <span className="text-charcoal font-bold">@RenbopBridal</span> on Instagram.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
