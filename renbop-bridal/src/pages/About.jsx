import React, { useState } from 'react';
import { motion } from 'framer-motion';

const About = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        comment: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for reaching out. We will respond shortly.');
        setFormData({ name: '', email: '', phone: '', comment: '' });
    };

    return (
        <div className="min-h-screen bg-ivory pt-32 pb-24">
            <div className="container-luxury">
                {/* Header */}
                <div className="text-center mb-24">
                    <span className="font-sans text-xs font-bold tracking-[0.2em] text-champagne uppercase mb-4 block">
                        Est. 2010
                    </span>
                    <h1 className="font-serif text-5xl md:text-6xl text-charcoal italic">The Atelier</h1>
                </div>

                {/* Story Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1549416878-b9ca95e1ee15?w=800&h=1000&fit=crop"
                                alt="Atelier"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white p-4 hidden lg:block border border-gray-100 shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop"
                                alt="Detail"
                                className="w-full h-full object-cover grayscale"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:pl-8 space-y-6"
                    >
                        <h2 className="font-serif text-4xl text-charcoal leading-tight">
                            Crafting dreams into <span className="italic text-champagne">reality</span>.
                        </h2>
                        <div className="space-y-4 font-sans text-gray-500 leading-relaxed text-sm md:text-base">
                            <p>
                                Renbop Bridal was founded on the belief that every bride deserves a gown as unique as her love story.
                                Situated in the heart of Vietnam's fashion district, our atelier is a sanctuary of creativity and craftsmanship.
                            </p>
                            <p>
                                We specialize in bespoke bridal wear, blending traditional techniques with modern silhouettes. Each gown is meticulously hand-crafted using the finest imported silks, French lace, and Swarovski crystals.
                            </p>
                            <p>
                                Beyond the dress, we offer a personalized experience. From the first sketch to the final fitting, our team is dedicated to making your journey unforgettable.
                            </p>
                        </div>
                        <div className="pt-4">
                            <img src="/signatures/signature.png" alt="" className="h-12 opacity-50" />
                            {/* Placeholder for signature, or remove if no image */}
                            <span className="font-serif text-xl italic text-charcoal block mt-2">Dung Hoang - Creative Director</span>
                        </div>
                    </motion.div>
                </div>

                {/* Contact Section */}
                <div className="bg-white p-8 lg:p-20 border border-charcoal/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-champagne/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                        {/* Information */}
                        <div>
                            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-8">Get in Touch</h2>
                            <p className="text-gray-500 mb-12 font-sans text-sm">
                                Whether you're ready to start your bespoke journey or have a question about our collections, we're here to help.
                            </p>

                            <div className="space-y-8">
                                <div>
                                    <h4 className="font-bold text-xs uppercase tracking-widest text-charcoal mb-2">Showroom</h4>
                                    <p className="text-gray-500 text-sm">123 Le Thanh Ton, District 1<br />Ho Chi Minh City, Vietnam</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs uppercase tracking-widest text-charcoal mb-2">Contact</h4>
                                    <p className="text-gray-500 text-sm">
                                        <a href="mailto:hello@renbop.com" className="hover:text-champagne transition-colors">hello@renbop.com</a><br />
                                        <a href="tel:+84901234567" className="hover:text-champagne transition-colors">+84 90 123 4567</a>
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <h4 className="font-bold text-xs uppercase tracking-widest text-charcoal mb-4">Follow Us</h4>
                                    <div className="flex gap-4">
                                        {['Instagram', 'Facebook', 'Pinterest'].map(social => (
                                            <a key={social} href="#" className="text-xs text-gray-400 hover:text-charcoal transition-colors underline decoration-transparent hover:decoration-current underline-offset-4">{social}</a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full py-3 bg-transparent border-b border-gray-300 focus:border-charcoal focus:outline-none transition-colors text-sm placeholder-gray-400"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full py-3 bg-transparent border-b border-gray-300 focus:border-charcoal focus:outline-none transition-colors text-sm placeholder-gray-400"
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="w-full py-3 bg-transparent border-b border-gray-300 focus:border-charcoal focus:outline-none transition-colors text-sm placeholder-gray-400"
                            />
                            <textarea
                                placeholder="How can we help?"
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                rows={4}
                                className="w-full py-3 bg-transparent border-b border-gray-300 focus:border-charcoal focus:outline-none transition-colors text-sm placeholder-gray-400 resize-none"
                            />

                            <div className="pt-4 text-right">
                                <button
                                    type="submit"
                                    className="bg-charcoal text-white px-10 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-champagne transition-all duration-300 shadow-lg"
                                >
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
