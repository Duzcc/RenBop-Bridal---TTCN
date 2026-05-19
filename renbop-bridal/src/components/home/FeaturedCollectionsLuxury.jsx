import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const collections = [
    {
        id: 1,
        title: "Renbop Collection",
        price: "1 - 5 Million VND",
        image: "https://images.unsplash.com/photo-1546193430-c2d207739ed7?q=80&w=1978&auto=format&fit=crop",
        link: "/collections/bộ-sưu-tập-từ-1-5tr",
        size: "large" // Takes up more space
    },
    {
        id: 2,
        title: "Renroy Collection",
        price: "5 - 7 Million VND",
        image: "https://images.unsplash.com/photo-1550246140-29f40b909e5a?q=80&w=2574&auto=format&fit=crop",
        link: "/collections/bst-từ-5-7tr",
        size: "medium"
    },
    {
        id: 3,
        title: "Royyal Collection",
        price: "8 - 12 Million VND",
        image: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=2564&auto=format&fit=crop",
        link: "/collections/bst-royyal-8-12tr",
        size: "medium"
    },
    {
        id: 4,
        title: "Luxury Couture",
        price: "12 - 30 Million VND",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2583&auto=format&fit=crop",
        link: "/collections/bst-luxury-12-30tr",
        size: "large"
    }
];

const FeaturedCollectionsLuxury = () => {
    const [headerRef, headerVisible] = useScrollReveal();

    return (
        <section className="section-padding bg-ivory overflow-hidden">
            <div className="container-luxury">
                {/* Section Header */}
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: 40 }}
                    animate={headerVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col md:flex-row justify-between items-end mb-16 lg:mb-24 gap-8 border-b border-charcoal/10 pb-12"
                >
                    <div className="max-w-2xl text-left">
                        <span className="block font-sans text-xs font-bold tracking-[0.25em] text-champagne uppercase mb-4">
                            Curated Selections
                        </span>
                        <h2 className="font-serif text-4xl md:text-6xl text-charcoal leading-tight">
                            Discover Our <br />
                            <span className="italic font-light">Collections</span>
                        </h2>
                    </div>
                    <p className="font-sans text-charcoal-light/70 max-w-sm text-left md:text-right leading-[1.8] text-sm md:text-base">
                        From delicate lace to structural satin, explore our handpicked series designed to define your perfect bridal moment.
                    </p>
                </motion.div>

                {/* Asymmetric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {collections.map((collection, index) => (
                        <CollectionCard
                            key={collection.id}
                            collection={collection}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const CollectionCard = ({ collection, index }) => {
    const [ref, isVisible] = useScrollReveal(0.1);
    
    // Create an asymmetric layout: alternate margin tops
    const asymmetricClass = index % 2 === 1 ? 'md:mt-24' : '';

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
            className={`relative group cursor-pointer ${asymmetricClass} ${
                collection.size === 'large' ? 'md:h-[650px]' : 'md:h-[550px]'
            } h-[450px] w-full overflow-hidden`}
        >
            <Link to={collection.link} className="block h-full w-full">
                {/* Image Base */}
                <div className="h-full w-full overflow-hidden relative">
                    <motion.div
                        className="h-full w-full bg-ivory-dark"
                        whileHover={{ scale: 1.07 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <img
                            src={collection.image}
                            alt={collection.title}
                            className="h-full w-full object-cover object-center"
                        />
                    </motion.div>

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700" />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col justify-end text-ivory">
                    <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                        <div className="flex items-center gap-3 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                            <div className="w-6 h-[1px] bg-champagne" />
                            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-champagne font-semibold">
                                View Collection
                            </span>
                        </div>
                        
                        <h3 className="font-serif text-3xl md:text-5xl mb-3 font-light tracking-wide">
                            {collection.title}
                        </h3>
                        
                        <p className="font-sans text-xs md:text-sm tracking-[0.15em] text-ivory/70 uppercase">
                            {collection.price}
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default FeaturedCollectionsLuxury;
