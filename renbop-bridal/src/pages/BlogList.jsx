import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BlogList = () => {
    // Mock blog posts
    const blogPosts = [
        {
            id: 1,
            title: 'The Art of Modern Bridal: 2025 Collection',
            excerpt: 'Exploring the delicate balance between tradition and contemporary design in our latest release.',
            date: 'OCT 12, 2024',
            author: 'Editorial Team',
            image: 'https://images.unsplash.com/photo-1594552072238-a2ea1cc37e0?w=1600&h=900&fit=crop',
            slug: 'ren-bop-comprehension',
            featured: true,
            category: 'Collections'
        },
        {
            id: 2,
            title: 'Finding Your Silhouette',
            excerpt: 'A guide to understanding fabric drape and structure for every body type.',
            date: 'SEP 28, 2024',
            author: 'Styling Desk',
            category: 'Guides',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
            slug: 'huong-dan-chon-vay-cuoi'
        },
        {
            id: 3,
            title: 'Bridal Trends: Ethereal Tulle',
            excerpt: 'Why soft, romantic fabrics are making a major comeback this season.',
            date: 'SEP 15, 2024',
            author: 'Trend Watch',
            category: 'Trends',
            image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=600&fit=crop',
            slug: 'xu-huong-vay-cuoi-2025'
        },
        {
            id: 4,
            title: 'Preserving Your Gown',
            excerpt: 'Expert tips on cleaning and storing your wedding dress after the big day.',
            date: 'AUG 30, 2024',
            author: 'Care Team',
            category: 'Advice',
            image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&h=600&fit=crop',
            slug: 'bao-quan-vay-cuoi'
        },
    ];

    const featuredPost = blogPosts.find(post => post.featured);
    const regularPosts = blogPosts.filter(post => !post.featured);

    return (
        <div className="min-h-screen bg-ivory pt-24 pb-24">
            <div className="container-luxury">
                {/* Header */}
                <div className="text-center mb-24">
                    <span className="font-sans text-xs font-bold tracking-[0.2em] text-champagne uppercase mb-4 block">
                        The Journal
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl text-charcoal italic">Editorial</h1>
                </div>

                {/* Featured Post */}
                {featuredPost && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-24 group cursor-pointer"
                    >
                        <Link to={`/blogs/news/${featuredPost.slug}`} className="block">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                <div className="lg:col-span-8 overflow-hidden">
                                    <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                        <img
                                            src={featuredPost.image}
                                            alt={featuredPost.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                        />
                                    </div>
                                </div>
                                <div className="lg:col-span-4 space-y-6 lg:pl-8">
                                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-champagne">
                                        <span>{featuredPost.category}</span>
                                        <span className="w-8 h-px bg-champagne"></span>
                                        <span className="text-gray-400">{featuredPost.date}</span>
                                    </div>
                                    <h2 className="font-serif text-3xl md:text-4xl text-charcoal leading-tight group-hover:text-champagne transition-colors duration-300">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="font-sans text-gray-500 leading-relaxed text-sm md:text-base">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal mt-4 group-hover:translate-x-2 transition-transform duration-300">
                                        Read Article <ArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Regular Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {regularPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={`/blogs/news/${post.slug}`} className="group block h-full flex flex-col">
                                <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-6 relative">
                                    <div className="absolute top-4 left-4 z-20 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                                        {post.category}
                                    </div>
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                </div>
                                <div className="flex-grow flex flex-col">
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 uppercase tracking-wider">
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.author}</span>
                                    </div>
                                    <h3 className="font-serif text-2xl text-charcoal mb-3 leading-snug group-hover:text-champagne transition-colors duration-300">
                                        {post.title}
                                    </h3>
                                    <p className="font-sans text-sm text-gray-500 leading-relaxed mb-6 line-clamp-3 flex-grow">
                                        {post.excerpt}
                                    </p>
                                    <span className="inline-block border-b border-charcoal/20 pb-1 text-xs font-bold uppercase tracking-widest text-charcoal group-hover:border-champagne group-hover:text-champagne transition-all self-start">
                                        Read More
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Newsletter Box */}
                <div className="mt-24 py-16 border-t border-b border-charcoal/10 text-center">
                    <h3 className="font-serif text-3xl text-charcoal italic mb-4">Join the Inner Circle</h3>
                    <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">Subscribe to receive updates, access to exclusive deals, and more.</p>
                    <form className="max-w-md mx-auto flex">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-grow bg-white border border-charcoal/20 px-4 py-3 text-sm focus:outline-none focus:border-charcoal"
                        />
                        <button className="bg-charcoal text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-champagne transition-colors">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BlogList;
