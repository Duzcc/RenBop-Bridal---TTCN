import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const testimonials = [
    {
        id: 1,
        text: "The moment I stepped into Renbop, I knew I was in good hands. The dress fit perfectly and the details were simply breathtaking. Thank you for making my dream come true.",
        author: "Minh Anh",
        role: "Hanoi Bride",
        image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2670&auto=format&fit=crop"
    },
    {
        id: 2,
        text: "Professional, attentive, and incredibly talented. The team helped me find a style that I didn't even know I wanted, but turned out to be absolutely perfect.",
        author: "Thu Ha",
        role: "Nam Dinh Bride",
        image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=2574&auto=format&fit=crop"
    },
    {
        id: 3,
        text: "Every stitch, every layer of tulle was perfection. I have never felt more beautiful than I did on my wedding day wearing the Royyal collection.",
        author: "Lan Huong",
        role: "Hanoi Bride",
        image: "https://images.unsplash.com/photo-1519741347686-c1e0aa4f7b4b?q=80&w=2574&auto=format&fit=crop"
    },
];

const TestimonialsLuxury = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [ref, isVisible] = useScrollReveal();

    const paginate = (newDirection) => {
        setDirection(newDirection);
        setCurrentIndex((prev) => {
            let next = prev + newDirection;
            if (next < 0) next = testimonials.length - 1;
            if (next >= testimonials.length) next = 0;
            return next;
        });
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        })
    };

    return (
        <section className="py-24 lg:py-32 bg-ivory-dark relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-ivory opacity-50 transform skew-x-12 translate-x-12" />
            <div className="container-luxury relative z-10">

                <motion.div
                    ref={ref}
                    initial={{ opacity: 0 }}
                    animate={isVisible ? { opacity: 1 } : {}}
                    transition={{ duration: 1 }}
                    className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24"
                >
                    {/* Left: Image Card */}
                    <div className="w-full lg:w-1/2 relative h-[500px] lg:h-[600px]">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="absolute inset-0 w-full h-full"
                            >
                                <img
                                    src={testimonials[currentIndex].image}
                                    alt={testimonials[currentIndex].author}
                                    className="w-full h-full object-cover object-top shadow-xl"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons (Overlapping Image) */}
                        <div className="absolute bottom-0 right-0 bg-white p-4 flex gap-4 shadow-lg z-20">
                            <button
                                onClick={() => paginate(-1)}
                                className="p-2 border border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => paginate(1)}
                                className="p-2 border border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="w-full lg:w-1/2 self-center">
                        <div className="mb-8 text-champagne">
                            <Quote size={48} strokeWidth={1} />
                        </div>

                        <div className="relative h-[280px]"> {/* Fixed height for text stability */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute top-0 left-0 w-full"
                                >
                                    <p className="font-serif text-3xl lg:text-4xl text-charcoal leading-snug mb-8 italic">
                                        "{testimonials[currentIndex].text}"
                                    </p>

                                    <div>
                                        <h4 className="font-sans text-lg font-bold text-charcoal uppercase tracking-wide">
                                            {testimonials[currentIndex].author}
                                        </h4>
                                        <p className="font-sans text-sm text-gray-500 mt-1">
                                            {testimonials[currentIndex].role}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex gap-2 mt-8">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setDirection(idx > currentIndex ? 1 : -1);
                                        setCurrentIndex(idx);
                                    }}
                                    className={`h-1 transition-all duration-300 ${idx === currentIndex ? 'w-12 bg-champagne' : 'w-4 bg-gray-300 hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default TestimonialsLuxury;
