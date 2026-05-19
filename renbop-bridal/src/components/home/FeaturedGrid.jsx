import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Heart } from 'lucide-react';

const FeaturedGrid = () => {
    const collections = [
        {
            id: 1,
            title: 'Wedding Dresses',
            subtitle: 'Timeless Elegance',
            image: 'https://images.unsplash.com/photo-1594552072238-a2ea1cc37e0?w=800&h=1000&fit=crop',
            link: '/collections/vay-cuoi'
        },
        {
            id: 2,
            title: 'Groom Suits',
            subtitle: 'Refined Sophistication',
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=1000&fit=crop',
            link: '/collections/ao-cuoi'
        },
        {
            id: 3,
            title: 'Áo Dài',
            subtitle: 'Traditional Beauty',
            image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&h=1000&fit=crop',
            link: '/collections/ao-dai'
        }
    ];

    return (
        <section className="py-20 px-4 lg:px-8 bg-gray-50">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-serif text-4xl md:text-5xl mb-4">Featured Collections</h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Discover our curated selection of luxury bridal wear
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {collections.map((collection, index) => (
                        <motion.div
                            key={collection.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="group relative overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-shadow duration-500"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[3/4] overflow-hidden">
                                <img
                                    src={collection.image}
                                    alt={collection.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />

                                {/* Overlay with Actions */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center gap-4">
                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        whileHover={{ scale: 1.1 }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white text-black px-6 py-3 text-sm uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-accent-green hover:text-white"
                                    >
                                        <Eye size={18} />
                                        Quick View
                                    </motion.button>

                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        whileHover={{ scale: 1.2 }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white p-3 rounded-full hover:bg-accent-green hover:text-white"
                                    >
                                        <Heart size={20} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Text Content */}
                            <Link to={collection.link} className="block p-6 text-center">
                                <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">{collection.subtitle}</p>
                                <h3 className="font-serif text-2xl font-bold group-hover:text-accent-green transition-colors">
                                    {collection.title}
                                </h3>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedGrid;
