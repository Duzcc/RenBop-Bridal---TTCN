import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiClient } from '../utils/apiClient';
import { Minus, Plus, ChevronDown, ChevronUp, Star, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState([]);
    
    const { addToCart } = useCart();

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedProductItemId, setSelectedProductItemId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [openAccordion, setOpenAccordion] = useState('details');

    const [orderType, setOrderType] = useState('RENTAL');
    const [rentalDates, setRentalDates] = useState({ start: '', end: '' });
    const [notes, setNotes] = useState('');
    const [measurements, setMeasurements] = useState({
        bust: '',
        waist: '',
        hip: '',
        shoulder: '',
        armLength: ''
    });

    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        fullName: '',
        phone: '',
        date: '',
        time: '',
        notes: ''
    });
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        if (product) {
            setBookingForm(prev => ({
                ...prev,
                notes: `Đăng ký thử mẫu váy: ${product.name}`
            }));
        }
    }, [product]);

    const handleBookAppointment = (e) => {
        e.preventDefault();
        if (!bookingForm.fullName || !bookingForm.phone || !bookingForm.date || !bookingForm.time) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }
        setBookingSuccess(true);
    };

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                // Lấy chi tiết sản phẩm
                const res = await apiClient(`/products/${id}`);
                if (res.success && res.data) {
                    setProduct(res.data);
                    
                    // Lấy sản phẩm liên quan (ví dụ: lấy bừa 4 sản phẩm cùng loại hoặc mới nhất)
                    const relatedRes = await apiClient(`/products?size=4&categorySlug=${res.data.category?.slug || ''}`);
                    if (relatedRes.success && relatedRes.data) {
                        setRelatedProducts(relatedRes.data.content);
                    }
                }
            } catch (err) {
                console.error("Lỗi khi tải chi tiết sản phẩm:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return <div className="py-20 text-center bg-ivory">Đang tải thông tin sản phẩm...</div>;
    if (!product) return <div className="py-20 text-center bg-ivory">Product not found.</div>;

    // Gallery fallback
    const galleryImages = product.imageUrls && product.imageUrls.length > 0 
        ? product.imageUrls 
        : ['https://images.unsplash.com/photo-1594552072238-b8a337eda7b9?w=800'];

    // Lấy các size có sẵn trong kho (đối với Mua và Thuê)
    const availableItems = product.items?.filter(item => item.status === 'AVAILABLE') || [];
    const availableSizes = [...new Set(availableItems.map(item => item.size))];

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        const item = availableItems.find(i => i.size === size);
        setSelectedProductItemId(item ? item.id : null);
    };

    const handleAddToCart = () => {
        if (orderType !== 'TAILORING' && !selectedSize) {
            alert('Vui lòng chọn Size.');
            return;
        }
        if (orderType === 'RENTAL') {
            if (!rentalDates.start || !rentalDates.end) {
                alert('Vui lòng chọn Ngày Nhận và Ngày Trả.');
                return;
            }
            if (new Date(rentalDates.start) >= new Date(rentalDates.end)) {
                alert('Ngày Trả phải sau Ngày Nhận.');
                return;
            }
        }

        const payload = {
            product,
            quantity: orderType === 'TAILORING' ? 1 : quantity,
            orderType,
            productItemId: orderType === 'TAILORING' ? null : selectedProductItemId,
            size: orderType === 'TAILORING' ? 'May Đo' : selectedSize,
            rentalStartDate: orderType === 'RENTAL' ? rentalDates.start : null,
            rentalEndDate: orderType === 'RENTAL' ? rentalDates.end : null,
            notes: notes,
            price: product.salePrice || product.price || product.basePrice || 0,
            measurements: orderType === 'TAILORING' ? measurements : null
        };

        addToCart(payload);
        alert(`Đã thêm vào giỏ hàng (${orderType}).`);
    };

    const toggleAccordion = (section) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    return (
        <div className="min-h-screen bg-ivory pt-12 pb-24">
            <div className="container-luxury">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                    {/* Left: Gallery (Stacked for luxury feel) */}
                    <div className="w-full lg:w-3/5 space-y-4">
                        {galleryImages.map((img, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="w-full bg-gray-100 overflow-hidden"
                            >
                                <img
                                    src={img}
                                    alt={`${product.name} - View ${index + 1}`}
                                    className="w-full h-auto object-cover"
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Right: Sticky Info Panel */}
                    <div className="w-full lg:w-2/5">
                        <div className="sticky top-32 space-y-8">
                            {/* Header */}
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-sans text-xs font-bold tracking-[0.2em] text-champagne uppercase">
                                        Renbop Bridal
                                    </span>
                                    {product.isNew && (
                                        <span className="bg-charcoal text-white text-[10px] uppercase font-bold px-2 py-1 tracking-widest">
                                            New Season
                                        </span>
                                    )}
                                </div>
                                <h1 className="font-serif text-3xl md:text-5xl text-charcoal mb-4 italic leading-tight">
                                    {product.name}
                                </h1>
                                <p className="font-sans text-xl text-charcoal/80">
                                    {(product.price || product.basePrice || 0).toLocaleString()} VND
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="w-12 h-px bg-champagne"></div>

                            {/* Order Type Selector */}
                            <div className="space-y-3">
                                <span className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal">Hình Thức</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {['RENTAL', 'PURCHASE', 'TAILORING'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setOrderType(type)}
                                            className={`py-3 text-xs font-bold uppercase tracking-widest border transition-colors ${
                                                orderType === type 
                                                    ? 'border-charcoal bg-charcoal text-white' 
                                                    : 'border-gray-200 text-gray-500 hover:border-charcoal'
                                            }`}
                                        >
                                            {type === 'RENTAL' ? 'Thuê' : type === 'PURCHASE' ? 'Mua' : 'May Đo'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Forms */}
                            <AnimatePresence mode="wait">
                                {/* Size Selector (Cho Thuê và Mua) */}
                                {orderType !== 'TAILORING' && (
                                    <motion.div key="size" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                        <div className="flex justify-between items-center mb-4 mt-6">
                                            <span className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal">Chọn Size</span>
                                        </div>
                                        {availableSizes.length > 0 ? (
                                            <div className="grid grid-cols-4 gap-2">
                                                {availableSizes.map((size) => (
                                                    <button
                                                        key={size}
                                                        onClick={() => handleSizeSelect(size)}
                                                        className={`h-12 border flex items-center justify-center transition-all ${
                                                            selectedSize === size
                                                                ? 'border-charcoal bg-charcoal text-white'
                                                                : 'border-gray-200 text-gray-600 hover:border-champagne'
                                                        }`}
                                                    >
                                                        <span className="text-sm font-medium">{size}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-red-500 italic">Hiện tại đã hết hàng (Size) cho tùy chọn này.</p>
                                        )}
                                    </motion.div>
                                )}

                                {/* Date Picker (Cho Thuê) */}
                                {orderType === 'RENTAL' && (
                                    <motion.div key="date" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-6">
                                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal mb-3 block">Thời Gian Thuê</span>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 block">Ngày Nhận</label>
                                                <input type="date" value={rentalDates.start} onChange={(e) => setRentalDates(prev => ({...prev, start: e.target.value}))} className="w-full p-3 border border-gray-200 text-sm focus:border-charcoal outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 block">Ngày Trả</label>
                                                <input type="date" value={rentalDates.end} onChange={(e) => setRentalDates(prev => ({...prev, end: e.target.value}))} className="w-full p-3 border border-gray-200 text-sm focus:border-charcoal outline-none" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Measurements & Notes (Cho May Đo) */}
                                {orderType === 'TAILORING' && (
                                    <motion.div key="tailoring" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-6">
                                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal mb-4 block">Nhập Số Đo Khách Hàng (Đơn vị: cm)</span>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="relative group">
                                                <input type="number" step="0.1" value={measurements.bust} onChange={(e) => setMeasurements({...measurements, bust: e.target.value})} className="input-luxury peer" placeholder=" " required />
                                                <label className="absolute left-0 top-3 text-gray-400 text-sm transition-all duration-300 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-champagne peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs">Vòng Ngực (Bust) *</label>
                                            </div>
                                            <div className="relative group">
                                                <input type="number" step="0.1" value={measurements.waist} onChange={(e) => setMeasurements({...measurements, waist: e.target.value})} className="input-luxury peer" placeholder=" " required />
                                                <label className="absolute left-0 top-3 text-gray-400 text-sm transition-all duration-300 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-champagne peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs">Vòng Eo (Waist) *</label>
                                            </div>
                                            <div className="relative group">
                                                <input type="number" step="0.1" value={measurements.hip} onChange={(e) => setMeasurements({...measurements, hip: e.target.value})} className="input-luxury peer" placeholder=" " required />
                                                <label className="absolute left-0 top-3 text-gray-400 text-sm transition-all duration-300 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-champagne peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs">Vòng Mông (Hip) *</label>
                                            </div>
                                            <div className="relative group">
                                                <input type="number" step="0.1" value={measurements.shoulder} onChange={(e) => setMeasurements({...measurements, shoulder: e.target.value})} className="input-luxury peer" placeholder=" " required />
                                                <label className="absolute left-0 top-3 text-gray-400 text-sm transition-all duration-300 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-champagne peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs">Rộng Vai (Shoulder) *</label>
                                            </div>
                                            <div className="relative group col-span-2">
                                                <input type="number" step="0.1" value={measurements.armLength} onChange={(e) => setMeasurements({...measurements, armLength: e.target.value})} className="input-luxury peer" placeholder=" " required />
                                                <label className="absolute left-0 top-3 text-gray-400 text-sm transition-all duration-300 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-champagne peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs">Dài Tay (Arm Length) *</label>
                                            </div>
                                        </div>

                                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal mb-3 mt-6 block">Ghi Chú Đặc Biệt (Tùy chọn)</span>
                                        <textarea 
                                            rows="3" 
                                            placeholder="Yêu cầu phối màu ren, điều chỉnh độ dài váy, v.v..." 
                                            value={notes} 
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full p-4 border border-gray-200 text-sm focus:border-champagne outline-none resize-none transition-colors"
                                        />
                                        <p className="text-xs text-charcoal-light/70 mt-2 italic font-serif">* Chuyên viên của Renbop Bridal sẽ gọi điện tư vấn và chốt form dáng lần cuối trước khi cắt rập.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        {/* Actions */}
                        <div className="space-y-4 pt-8">
                                <button
                                    onClick={handleAddToCart}
                                    className="w-full py-4 bg-charcoal text-white font-sans text-xs font-bold uppercase tracking-[0.2em] hover:bg-champagne transition-colors duration-300 shadow-lg"
                                >
                                    Add to Bag
                                </button>

                                <button 
                                    onClick={() => {
                                        setIsBookingOpen(true);
                                        setBookingSuccess(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 border border-charcoal text-charcoal font-sans text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                >
                                    <Calendar size={16} />
                                    Book an Appointment
                                </button>
                            </div>

                            {/* Accordion Details */}
                            <div className="border-t border-gray-200 mt-8">
                                <AccordionItem
                                    title="Product Details"
                                    isOpen={openAccordion === 'details'}
                                    onClick={() => toggleAccordion('details')}
                                >
                                    <ul className="list-disc list-inside space-y-1 text-gray-500">
                                        <li>Silhouette: A-Line</li>
                                        <li>Fabric: Imported French Tulle & Satin</li>
                                        <li>Detail: Hand-beaded bodice</li>
                                        <li>Care: Dry Clean Only</li>
                                    </ul>
                                </AccordionItem>
                                <AccordionItem
                                    title="Shipping & Returns"
                                    isOpen={openAccordion === 'shipping'}
                                    onClick={() => toggleAccordion('shipping')}
                                >
                                    <p className="text-gray-500">
                                        Complimentary standard shipping on all orders. Returns accepted within 14 days of delivery. Custom orders are final sale.
                                    </p>
                                </AccordionItem>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complete The Look Section */}
                <div className="mt-32 border-t border-charcoal/10 pt-16">
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-3xl text-charcoal italic mb-4">Complete The Look</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {relatedProducts.map(p => (
                            <Link to={`/products/${p.id}`} key={p.id} className="group cursor-pointer block">
                                <div className="aspect-[3/4] overflow-hidden mb-3 bg-gray-100">
                                    <img 
                                        src={p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : 'https://images.unsplash.com/photo-1594552072238-b8a337eda7b9?w=800'} 
                                        alt={p.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    />
                                </div>
                                <h3 className="font-serif text-base text-charcoal">{p.name}</h3>
                                <p className="text-xs text-gray-500">{(p.salePrice || p.price || p.basePrice || 0).toLocaleString()} VND</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Appointment Booking Modal */}
            <AnimatePresence>
                {isBookingOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white max-w-lg w-full p-8 relative border border-charcoal/5 shadow-2xl"
                        >
                            <button
                                onClick={() => setIsBookingOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-charcoal transition-colors font-sans text-lg font-bold"
                            >
                                ✕
                            </button>

                            {!bookingSuccess ? (
                                <form onSubmit={handleBookAppointment} className="space-y-6">
                                    <div className="text-center mb-8">
                                        <span className="font-sans text-xs font-bold tracking-[0.2em] text-champagne uppercase mb-2 block">
                                            Fitting Session
                                        </span>
                                        <h2 className="font-serif text-3xl text-charcoal italic">Đặt Lịch Thử Váy</h2>
                                        <p className="text-xs text-gray-500 font-sans mt-2">
                                            Trải nghiệm không gian thử đồ riêng tư & dịch vụ tư vấn cao cấp tại Renbop Bridal.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                value={bookingForm.fullName}
                                                onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                                                className="w-full py-3 bg-transparent border-b border-gray-300 focus:border-charcoal focus:outline-none transition-colors text-sm placeholder-gray-400 font-sans text-charcoal"
                                                placeholder="Họ và Tên *"
                                            />
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="tel"
                                                required
                                                value={bookingForm.phone}
                                                onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                                className="w-full py-3 bg-transparent border-b border-gray-300 focus:border-charcoal focus:outline-none transition-colors text-sm placeholder-gray-400 font-sans text-charcoal"
                                                placeholder="Số Điện Thoại *"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 block font-sans font-bold">Ngày Hẹn *</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={bookingForm.date}
                                                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                                                    className="w-full p-3 border border-gray-200 text-sm focus:border-charcoal outline-none font-sans text-charcoal bg-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 block font-sans font-bold">Giờ Hẹn *</label>
                                                <select
                                                    required
                                                    value={bookingForm.time}
                                                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                                                    className="w-full p-3 border border-gray-200 text-sm focus:border-charcoal outline-none font-sans bg-white text-charcoal"
                                                >
                                                    <option value="">Chọn giờ...</option>
                                                    {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 block font-sans font-bold">Ghi chú & Yêu cầu riêng</label>
                                            <textarea
                                                rows="3"
                                                value={bookingForm.notes}
                                                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                                className="w-full p-3 border border-gray-200 text-sm focus:border-charcoal outline-none resize-none transition-colors font-sans text-charcoal bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-charcoal text-white font-sans text-xs font-bold uppercase tracking-[0.2em] hover:bg-champagne transition-colors duration-300 shadow-lg mt-6"
                                    >
                                        Xác Nhận Đặt Lịch
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-8 space-y-6">
                                    <div className="w-16 h-16 bg-[#c9a96e]/10 text-champagne rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar size={28} />
                                    </div>
                                    <h3 className="font-serif text-2xl text-charcoal italic">Đặt Lịch Thành Công!</h3>
                                    <div className="space-y-3 font-sans text-sm text-gray-500 leading-relaxed px-4 text-center">
                                        <p>
                                            Cảm ơn quý khách <strong>{bookingForm.fullName}</strong> đã đặt lịch thử váy <strong>{product.name}</strong> tại Renbop Bridal.
                                        </p>
                                        <p>
                                            Lịch hẹn của bạn: <strong className="text-charcoal">{bookingForm.date} vào lúc {bookingForm.time}</strong>.
                                        </p>
                                        <p className="text-xs text-champagne italic bg-[#c9a96e]/5 py-2 px-3 border border-[#c9a96e]/10 inline-block mt-2">
                                            Chuyên viên tư vấn của chúng tôi sẽ gọi điện xác nhận lịch qua số điện thoại <strong>{bookingForm.phone}</strong> trong vòng 15 phút.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsBookingOpen(false)}
                                        className="mt-6 px-10 py-3 bg-charcoal text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-champagne transition-colors"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AccordionItem = ({ title, isOpen, onClick, children }) => {
    return (
        <div className="border-b border-gray-200">
            <button
                onClick={onClick}
                className="w-full py-4 flex justify-between items-center text-left"
            >
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal">{title}</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 text-sm font-sans leading-relaxed">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetail;
