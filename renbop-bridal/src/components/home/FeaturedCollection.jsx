import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const collections = [
    {
        id: 1,
        title: 'COLLECTION 2025',
        image: 'https://images.unsplash.com/photo-1594552072238-b8a337eda7b9?q=80&w=2787&auto=format&fit=crop',
        link: '/collections/2025'
    },
    {
        id: 2,
        title: 'COLLECTION 2024',
        image: 'https://images.unsplash.com/photo-1532009324734-20a7a5813719?q=80&w=2670&auto=format&fit=crop',
        link: '/collections/2024'
    },
    {
        id: 3,
        title: 'ÁO DÀI CƯỚI',
        image: 'https://images.unsplash.com/photo-1596451190630-186aff535bf2?q=80&w=2670&auto=format&fit=crop',
        link: '/collections/ao-dai'
    }
];

const FeaturedCollection = () => {
    return (
        <section className="py-20 md:py-24">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl md:text-4xl mb-4">Discover Our World</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Timeless elegance tailored for your perfect moment.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                    {collections.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="group relative h-[500px] overflow-hidden cursor-pointer"
                        >
                            <Link to={item.link} className="block w-full h-full">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${item.image})` }}
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                                <div className="absolute bottom-8 left-0 right-0 text-center">
                                    <h3 className="text-xl tracking-widest uppercase font-medium mb-2">{item.title}</h3>
                                    <span className="text-sm border-b border-white pb-1 group-hover:border-b-2 transition-all">View Collection</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedCollection;
