import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-charcoal text-ivory pt-24 pb-12 border-t border-charcoal-light">
            <div className="container-luxury">
                {/* Top Section: Newsletter & Branding */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20 border-b border-white/10 pb-16">
                    <div className="lg:col-span-5 space-y-8">
                        <Link to="/" className="block">
                            <h2 className="font-serif text-3xl md:text-4xl text-ivory tracking-[0.2em] font-light">
                                RENBOP <span className="font-sans text-xl tracking-[0.3em] text-champagne">BRIDAL</span>
                            </h2>
                        </Link>
                        <p className="text-gray-400 font-sans text-sm leading-[1.8] max-w-sm">
                            Defining the art of elegance for the modern bride.
                            Exquisite gowns, timeless designs, and unforgettable moments.
                        </p>
                        <div className="flex space-x-5 pt-2">
                            <SocialLink href="#" icon={<Facebook size={18} strokeWidth={1.5} />} label="Facebook" />
                            <SocialLink href="#" icon={<Instagram size={18} strokeWidth={1.5} />} label="Instagram" />
                            <SocialLink href="#" icon={<TiktokIcon />} label="TikTok" />
                        </div>
                    </div>

                    <div className="lg:col-span-6 lg:col-start-7 lg:pl-8 flex flex-col justify-center">
                        <h3 className="font-serif text-2xl text-ivory mb-3 font-light tracking-wide">Join The Atelier</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-md">
                            Subscribe for exclusive access to trunk shows, new collections, and bridal inspiration.
                        </p>
                        <form className="group relative max-w-md flex items-center">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="w-full bg-transparent border-b border-gray-600/50 py-3 text-ivory text-sm tracking-wide placeholder-gray-500 focus:outline-none focus:border-champagne transition-colors duration-500"
                            />
                            <button
                                type="button"
                                className="absolute right-0 text-gray-500 group-focus-within:text-champagne hover:text-ivory transition-colors duration-300"
                            >
                                <ArrowRight size={18} strokeWidth={1.5} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Middle Section: Navigation & Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Column 1: Explore */}
                    <div>
                        <h4 className="font-sans text-xs font-bold tracking-widest text-champagne uppercase mb-8">Explore</h4>
                        <ul className="space-y-4">
                            <FooterLink to="/collections/latest" label="New Arrivals" />
                            <FooterLink to="/collections/bộ-sưu-tập-từ-1-5tr" label="Renbop Collection" />
                            <FooterLink to="/collections/bst-royyal-8-12tr" label="Royyal Collection" />
                            <FooterLink to="/collections/bst-luxury-12-30tr" label="Luxury Couture" />
                            <FooterLink to="/pages/feedback" label="Real Brides" />
                        </ul>
                    </div>

                    {/* Column 2: Customer Service */}
                    <div>
                        <h4 className="font-sans text-xs font-bold tracking-widest text-champagne uppercase mb-8">Client Care</h4>
                        <ul className="space-y-4">
                            <FooterLink to="/pages/contact" label="Book an Appointment" />
                            <FooterLink to="/pages/contact" label="Contact Us" />
                            <FooterLink to="#" label="Shipping & Returns" />
                            <FooterLink to="#" label="Size Guide" />
                            <FooterLink to="#" label="FAQ" />
                        </ul>
                    </div>

                    {/* Column 3: Showrooms */}
                    <div className="lg:col-span-2">
                        <h4 className="font-sans text-xs font-bold tracking-widest text-champagne uppercase mb-8">Our Boutiques</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <p className="font-serif text-lg text-ivory">Hanoi Flagship</p>
                                <div className="text-sm text-gray-400 space-y-1">
                                    <p className="flex items-start gap-2">
                                        <MapPin size={16} className="mt-1 shrink-0" />
                                        99 Trần Hòa, Hoàng Mai, Hà Nội
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone size={16} />
                                        0378.194.825
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="font-serif text-lg text-ivory">Nam Dinh Boutique</p>
                                <div className="text-sm text-gray-400 space-y-1">
                                    <p className="flex items-start gap-2">
                                        <MapPin size={16} className="mt-1 shrink-0" />
                                        Giao Thủy, Nam Định
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone size={16} />
                                        0378.194.825
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-charcoal-light text-xs text-gray-500 font-sans">
                    <p>© 2026 RENBOP BRIDAL. All Rights Reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-champagne transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-champagne transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialLink = ({ href, icon, label }) => (
    <a
        href={href}
        aria-label={label}
        className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-charcoal hover:bg-champagne hover:border-champagne transition-all duration-500 ease-out"
    >
        {icon}
    </a>
);

const FooterLink = ({ to, label }) => (
    <li>
        <Link
            to={to}
            className="text-sm text-gray-400 hover:text-ivory hover:translate-x-1 transition-all duration-300 inline-block font-sans"
        >
            {label}
        </Link>
    </li>
);

const TiktokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

export default Footer;
