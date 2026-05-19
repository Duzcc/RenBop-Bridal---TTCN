import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

const TestimonialCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const testimonials = [
        {
            id: 1,
            name: 'Nguyễn Minh Anh',
            role: 'Bride 2024',
            videoThumbnail: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=600&fit=crop',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            quote: 'My dream dress became reality. The attention to detail was extraordinary.'
        },
        {
            id: 2,
            name: 'Trần Hoàng Nam',
            role: 'Groom 2024',
            videoThumbnail: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=800&h=600&fit=crop',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            quote: 'Impeccable service and the perfect suit for my special day.'
        },
        {
            id: 3,
            name: 'Lê Thu Hà',
            role: 'Bride 2025',
            videoThumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            quote: 'Every moment felt magical in my Renbop gown.'
        }
    ];

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const currentTestimonial = testimonials[currentIndex];

    return (
        <section className="py-20 px-4 lg:px-8 bg-white">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-serif text-4xl md:text-5xl mb-4">Client Stories</h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Hear from couples who found their perfect look
                    </p>
                </motion.div>

                <div className="max-w-5xl mx-auto">
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                            >
                                {/* Video Card */}
                                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-lg group">
                                    <img
                                        src={currentTestimonial.videoThumbnail}
                                        alt={currentTestimonial.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => setIsPlaying(true)}
                                        className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors"
                                    >
                                        <div className="bg-white/90 p-6 rounded-full group-hover:bg-accent-green group-hover:text-white transition-all">
                                            <Play size={32} fill="currentColor" />
                                        </div>
                                    </button>
                                </div>

                                {/* Testimonial Text */}
                                <div className="text-center md:text-left">
                                    <p className="text-2xl md:text-3xl font-serif italic text-gray-700 mb-6">
                                        "{currentTestimonial.quote}"
                                    </p>
                                    <div>
                                        <p className="font-bold text-lg">{currentTestimonial.name}</p>
                                        <p className="text-gray-500 uppercase text-sm tracking-wider">{currentTestimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex justify-center gap-4 mt-12">
                            <button
                                onClick={handlePrev}
                                className="bg-black text-white p-3 rounded-full hover:bg-accent-green transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="bg-black text-white p-3 rounded-full hover:bg-accent-green transition-colors"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-accent-green w-8' : 'bg-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Video Modal */}
                <AnimatePresence>
                    {isPlaying && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
                            onClick={() => setIsPlaying(false)}
                        >
                            <button
                                className="absolute top-8 right-8 text-white hover:text-accent-green transition-colors"
                                onClick={() => setIsPlaying(false)}
                            >
                                <X size={32} />
                            </button>
                            <div className="w-full max-w-4xl aspect-video">
                                <iframe
                                    className="w-full h-full"
                                    src={currentTestimonial.videoUrl}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default TestimonialCarousel;
