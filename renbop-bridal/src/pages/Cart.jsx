import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-ivory flex flex-col items-center justify-center text-center p-4">
                <h1 className="font-serif text-4xl text-charcoal mb-6 decoration-champagne underline decoration-wavy underline-offset-8">Your Items</h1>
                <p className="font-sans text-gray-500 mb-10 tracking-wide">Your shopping bag is currently empty.</p>
                <Link
                    to="/collections/all"
                    className="inline-block bg-charcoal text-white px-10 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-champagne transition-all duration-300"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ivory pt-24 pb-24">
            <div className="container-luxury">
                <h1 className="font-serif text-4xl md:text-5xl mb-16 text-center text-charcoal italic">Shopping Bag</h1>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Cart Items */}
                    <div className="w-full lg:w-2/3">
                        <div className="hidden md:grid grid-cols-12 gap-4 border-b border-charcoal/10 pb-4 text-xs uppercase tracking-[0.2em] font-bold text-gray-400">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-2 text-center">Price</div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        <div className="divide-y divide-charcoal/5">
                            <AnimatePresence>
                                {cartItems.map((item) => {
                                    // Handle image url parsing (product.imageUrls could be a JSON array string)
                                    let imgUrl = 'https://images.unsplash.com/photo-1594552072238-b8a337eda7b9?w=800';
                                    const rawUrls = item.product?.imageUrls || item.imageUrls;
                                    if (rawUrls) {
                                        if (Array.isArray(rawUrls)) {
                                            imgUrl = rawUrls[0] || imgUrl;
                                        } else if (typeof rawUrls === 'string') {
                                            try {
                                                const parsed = JSON.parse(rawUrls);
                                                if (Array.isArray(parsed) && parsed.length > 0) {
                                                    imgUrl = parsed[0];
                                                } else {
                                                    imgUrl = rawUrls;
                                                }
                                            } catch (e) {
                                                imgUrl = rawUrls;
                                            }
                                        }
                                    }

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            key={item.cartItemId || `${item.product?.id}-${item.size}`}
                                            className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center overflow-hidden"
                                        >
                                            <div className="col-span-1 md:col-span-6 flex gap-6">
                                                <div className="w-24 h-32 bg-gray-100 flex-shrink-0 relative overflow-hidden">
                                                    <img
                                                        src={imgUrl}
                                                        alt={item.product?.name || item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <h3 className="font-serif text-xl text-charcoal mb-2">{item.product?.name || item.name}</h3>
                                                    <p className="text-sm text-gray-500 mb-2 font-sans uppercase tracking-wider text-xs">Size: {item.size}</p>
                                                    {item.orderType && (
                                                        <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-100 self-start mb-3 uppercase tracking-wider">
                                                            {item.orderType === 'PURCHASE' ? 'Mua đứt' : item.orderType === 'RENTAL' ? 'Thuê đồ' : 'May đo'}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => removeFromCart(item.cartItemId)}
                                                        className="text-xs text-gray-400 flex items-center hover:text-red-500 transition-colors uppercase tracking-widest font-bold"
                                                    >
                                                        <Trash2 size={12} className="mr-2" /> Remove
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="col-span-1 md:col-span-2 md:text-center text-sm font-sans text-gray-600">
                                                <span className="md:hidden font-bold mr-2">Price:</span>
                                                {item.price.toLocaleString()}
                                            </div>

                                            <div className="col-span-1 md:col-span-2 flex items-center md:justify-center">
                                                <span className="md:hidden font-bold mr-4">Qty:</span>
                                                <div className="flex items-center border border-gray-200">
                                                    <button
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-charcoal"
                                                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <div className="w-8 h-8 flex items-center justify-center font-sans text-xs font-medium text-charcoal">
                                                        {item.quantity}
                                                    </div>
                                                    <button
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-charcoal"
                                                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="col-span-1 md:col-span-2 md:text-right font-medium font-sans text-charcoal">
                                                <span className="md:hidden font-bold mr-2">Total:</span>
                                                {(item.price * item.quantity).toLocaleString()}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-8 sticky top-32 border border-charcoal/5 shadow-[0_0_40px_-15px_rgba(0,0,0,0.05)]">
                            <h2 className="font-serif text-2xl text-charcoal mb-8 italic">Order Summary</h2>

                            <div className="flex justify-between items-center mb-4 text-sm font-sans">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium text-charcoal">{subtotal.toLocaleString()} VND</span>
                            </div>
                            <div className="flex justify-between items-center mb-8 text-sm font-sans">
                                <span className="text-gray-500">Shipping</span>
                                <span className="text-gray-500 italic">Calculated at checkout</span>
                            </div>

                            <div className="border-t border-charcoal/10 pt-6 mb-8 flex justify-between items-center">
                                <span className="font-bold text-lg font-serif text-charcoal">Total</span>
                                <span className="font-bold text-lg font-serif text-charcoal">{subtotal.toLocaleString()} VND</span>
                            </div>

                            <Link
                                to="/checkout"
                                className="w-full bg-charcoal text-white py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-champagne transition-all duration-300 flex items-center justify-center gap-3 group shadow-lg"
                            >
                                Proceed to Checkout
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <p className="text-[10px] text-center text-gray-400 mt-6 uppercase tracking-wider">
                                Secure Checkout • Free Shipping on Orders Over 50M
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
