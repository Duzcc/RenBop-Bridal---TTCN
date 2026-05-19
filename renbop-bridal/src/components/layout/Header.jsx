import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Search, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserMenu from '../common/UserMenu';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [megaMenuOpen, setMegaMenuOpen] = useState(null);
    const { totalItems } = useCart();

    // Scroll detection for glassmorphism effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const collections = [
        {
            name: 'RENBOP COLLECTION',
            path: '/collections/bộ-sưu-tập-từ-1-5tr',
            range: '1-5TR',
            description: 'Elegant bridal gowns for every budget'
        },
        {
            name: 'RENROY COLLECTION',
            path: '/collections/bst-từ-5-7tr',
            range: '5-7TR',
            description: 'Premium designs with exquisite details'
        },
        {
            name: 'ROYYAL COLLECTION',
            path: '/collections/bst-royyal-8-12tr',
            range: '8-12TR',
            description: 'Luxury gowns for the discerning bride'
        },
        {
            name: 'LUXURY COLLECTION',
            path: '/collections/bst-luxury-12-30tr',
            range: '12-30TR',
            description: 'Haute couture bridal masterpieces'
        },
    ];

    const menuSections = [
        { name: 'Home', path: '/', type: 'link' },
        { name: 'Collections', type: 'mega', items: collections },
        { name: 'Feedback', path: '/pages/feedback', type: 'link' },
        { name: 'Blog', path: '/blogs/news', type: 'link' },
        { name: 'About', path: '/pages/contact', type: 'link' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? 'bg-ivory/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-ivory-dark py-3'
                : 'bg-gradient-to-b from-black/60 via-black/20 to-transparent py-5 md:py-8'
                }`}
        >
            {/* Main Header */}
            <div className="container-luxury">
                <div className="flex items-center justify-between">
                    {/* Left: Menu Button (Mobile) */}
                    <button
                        className="lg:hidden p-2 hover:text-champagne transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={24} strokeWidth={1.5} />
                    </button>

                    {/* Left: Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {menuSections.slice(0, 2).map((section) => (
                            section.type === 'link' ? (
                                <Link
                                    key={section.name}
                                    to={section.path}
                                    className={`text-[11px] font-sans font-semibold tracking-[0.15em] uppercase transition-colors duration-300 hover:text-champagne ${isScrolled ? 'text-charcoal' : 'text-ivory/90'}`}
                                >
                                    {section.name}
                                </Link>
                            ) : (
                                <div
                                    key={section.name}
                                    className="relative"
                                    onMouseEnter={() => setMegaMenuOpen(section.name)}
                                    onMouseLeave={() => setMegaMenuOpen(null)}
                                >
                                    <button className={`flex items-center gap-1 text-[11px] font-sans font-semibold tracking-[0.15em] uppercase transition-colors duration-300 hover:text-champagne ${isScrolled ? 'text-charcoal' : 'text-ivory/90'}`}>
                                        {section.name}
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${megaMenuOpen === section.name ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Mega Menu Dropdown */}
                                    <AnimatePresence>
                                        {megaMenuOpen === section.name && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute left-0 top-full mt-4 w-64 glass rounded-lg shadow-xl p-6"
                                            >
                                                <div className="space-y-4">
                                                    {section.items.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            to={item.path}
                                                            className="block group"
                                                        >
                                                            <div className="flex items-baseline justify-between mb-1">
                                                                <span className="text-sm font-serif text-charcoal group-hover:text-champagne transition-colors">
                                                                    {item.name}
                                                                </span>
                                                                <span className="text-xs text-champagne font-medium">
                                                                    {item.range}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-charcoal-light">
                                                                {item.description}
                                                            </p>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        ))}
                    </nav>

                    {/* Center: Logo */}
                    <Link
                        to="/"
                        className="absolute left-1/2 transform -translate-x-1/2 lg:relative lg:left-0 lg:transform-none"
                    >
                        <h1 className={`font-serif text-2xl md:text-3xl tracking-widest uppercase transition-colors duration-300 hover:text-champagne ${isScrolled ? 'text-charcoal' : 'text-ivory'}`}>
                            RENBOP BRIDAL
                        </h1>
                    </Link>

                    {/* Right: Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {menuSections.slice(2).map((section) => (
                            <Link
                                key={section.name}
                                to={section.path}
                                className={`text-[11px] font-sans font-semibold tracking-[0.15em] uppercase transition-colors duration-300 hover:text-champagne ${isScrolled ? 'text-charcoal' : 'text-ivory/90'}`}
                            >
                                {section.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Icons */}
                    <div className={`flex items-center gap-5 transition-colors duration-300 ${isScrolled ? 'text-charcoal' : 'text-ivory'}`}>
                        <button
                            className="hover:text-champagne transition-colors"
                            aria-label="Search"
                        >
                            <Search size={18} strokeWidth={1.5} />
                        </button>
                        <div className="scale-90 opacity-90 hover:opacity-100 hover:text-champagne transition-all cursor-pointer">
                            <UserMenu />
                        </div>
                        <Link
                            to="/cart"
                            className="relative hover:text-champagne transition-colors"
                        >
                            <ShoppingBag size={18} strokeWidth={1.5} />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-champagne text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black z-[60] lg:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed top-0 left-0 bottom-0 w-[320px] bg-ivory z-[70] overflow-y-auto lg:hidden"
                        >
                            {/* Drawer Header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <span className="font-serif text-2xl text-charcoal">Menu</span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="hover:text-champagne transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Drawer Navigation */}
                            <nav className="p-6 space-y-6">
                                {/* Home */}
                                <Link
                                    to="/"
                                    className="block text-lg font-sans font-medium text-charcoal hover:text-champagne transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Home
                                </Link>

                                {/* Collections */}
                                <div className="space-y-3">
                                    <span className="block text-xs font-sans font-semibold tracking-widest uppercase text-charcoal-light">
                                        Collections
                                    </span>
                                    {collections.map((collection) => (
                                        <Link
                                            key={collection.name}
                                            to={collection.path}
                                            className="block pl-4 border-l-2 border-champagne/30 hover:border-champagne transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className="flex items-baseline justify-between mb-1">
                                                <span className="text-base font-serif text-charcoal">
                                                    {collection.name}
                                                </span>
                                                <span className="text-xs text-champagne font-medium">
                                                    {collection.range}
                                                </span>
                                            </div>
                                            <p className="text-xs text-charcoal-light">
                                                {collection.description}
                                            </p>
                                        </Link>
                                    ))}
                                </div>

                                {/* Other Pages */}
                                {menuSections.slice(2).map((section) => (
                                    <Link
                                        key={section.name}
                                        to={section.path}
                                        className="block text-lg font-sans font-medium text-charcoal hover:text-champagne transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {section.name}
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;

