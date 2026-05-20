import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/apiClient';
import {
    ChevronLeft, Lock, Loader2, CheckCircle2,
    Smartphone, QrCode, CreditCard, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Bước Checkout: 1=Thông tin, 2=Phương thức TT, 3=Xác nhận & Thanh toán ──
const STEPS = ['Thông tin', 'Thanh toán', 'Hoàn tất'];

const PAYMENT_METHODS = [
    {
        id: 'VNPAY',
        label: 'VNPAY',
        desc: 'Thanh toán qua cổng VNPAY (Thẻ ATM/Visa)',
        icon: QrCode,
        badge: 'Phổ biến',
    },
    {
        id: 'MOMO',
        label: 'MoMo',
        desc: 'Thanh toán qua ví điện tử MoMo',
        icon: Smartphone,
        badge: null,
    },
    {
        id: 'PAYPAL',
        label: 'PayPal',
        desc: 'Thanh toán quốc tế qua PayPal',
        icon: CreditCard,
        badge: null,
    },
    {
        id: 'COD',
        label: 'COD',
        desc: 'Thanh toán khi nhận hàng',
        icon: Truck,
        badge: null,
    },
];

const Checkout = () => {
    const { cartItems, subtotal, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [step, setStep]           = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg]   = useState('');

    // Step 1 form data
    const [formData, setFormData] = useState({
        email: '', firstName: '', lastName: '',
        address: '', city: '', phone: '', saveInfo: false
    });

    // Step 2: payment
    const [paymentMethod, setPaymentMethod] = useState('VNPAY');

    // Step 3: kết quả
    const [createdOrder, setCreatedOrder]   = useState(null);
    const [payment, setPayment]             = useState(null);
    const [paymentDone, setPaymentDone]     = useState(false);

    const [searchParams] = useSearchParams();
    const queryOrderId = searchParams.get('orderId');
    const [loadingOrder, setLoadingOrder] = useState(false);

    const paymentAmount = createdOrder ? (createdOrder.totalAmount || 0) : subtotal;

    useEffect(() => {
        if (queryOrderId) {
            const fetchOrder = async () => {
                setLoadingOrder(true);
                setErrorMsg('');
                try {
                    const res = await apiClient(`/orders/${queryOrderId}`);
                    if (res.success && res.data) {
                        if (res.data.status !== 'PENDING') {
                            setErrorMsg('Đơn hàng này không ở trạng thái chờ thanh toán.');
                            setTimeout(() => navigate('/profile'), 3000);
                            return;
                        }
                        setCreatedOrder(res.data);
                        setStep(2);
                    } else {
                        setErrorMsg('Không thể tải thông tin đơn hàng.');
                    }
                } catch (err) {
                    console.error("Lỗi tải đơn hàng:", err);
                    setErrorMsg(err.message || 'Lỗi khi tải đơn hàng.');
                } finally {
                    setLoadingOrder(false);
                }
            };
            fetchOrder();
        }
    }, [queryOrderId, navigate]);

    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // ── STEP 1 → 2: Tạo đơn hàng ──────────────────────────────────────────
    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setErrorMsg('Vui lòng đăng nhập để đặt hàng.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        if (cartItems.length === 0) { setErrorMsg('Giỏ hàng đang trống.'); return; }

        setSubmitting(true);
        setErrorMsg('');
        try {
            // Nhóm sản phẩm theo orderType vì mỗi OrderRequest chỉ nhận 1 orderType
            const ordersByType = cartItems.reduce((acc, item) => {
                const type = item.orderType || 'PURCHASE';
                if (!acc[type]) acc[type] = [];
                acc[type].push(item);
                return acc;
            }, {});

            let firstCreatedOrder = null;

            for (const [type, items] of Object.entries(ordersByType)) {
                // Backend không hỗ trợ 'quantity', nên nếu quantity > 1, phải nhân bản phần tử trong mảng items
                let expandedItems = [];
                items.forEach(i => {
                    for (let q = 0; q < i.quantity; q++) {
                        expandedItems.push({
                            productItemId: i.productItemId || null,
                            price: i.price || 0,
                            rentalStartDate: i.rentalStartDate && i.rentalStartDate !== '' ? i.rentalStartDate : null,
                            rentalEndDate: i.rentalEndDate && i.rentalEndDate !== '' ? i.rentalEndDate : null,
                            notes: i.notes || '',
                            measurements: i.measurements ? {
                                bust: i.measurements.bust && i.measurements.bust !== '' ? parseFloat(i.measurements.bust) : null,
                                waist: i.measurements.waist && i.measurements.waist !== '' ? parseFloat(i.measurements.waist) : null,
                                hip: i.measurements.hip && i.measurements.hip !== '' ? parseFloat(i.measurements.hip) : null,
                                shoulder: i.measurements.shoulder && i.measurements.shoulder !== '' ? parseFloat(i.measurements.shoulder) : null,
                                armLength: i.measurements.armLength && i.measurements.armLength !== '' ? parseFloat(i.measurements.armLength) : null
                            } : null
                        });
                    }
                });

                const payload = {
                    orderType: type,
                    note: `Liên hệ: ${formData.phone} | Khách: ${formData.firstName} ${formData.lastName} | Giao đến: ${formData.address}, ${formData.city}`,
                    items: expandedItems
                };

                console.error("Gửi payload tạo đơn hàng (JSON):", JSON.stringify(payload, null, 2));
                const res = await apiClient('/orders', { method: 'POST', body: JSON.stringify(payload) });
                if (res.success && !firstCreatedOrder) {
                    firstCreatedOrder = res.data; // Dùng Order đầu tiên để thanh toán
                }
            }

            if (firstCreatedOrder) {
                setCreatedOrder(firstCreatedOrder);
                clearCart();
                setStep(2);
            }
        } catch (err) {
            console.error("Lỗi tạo đơn hàng:", err);
            console.error("Lỗi message:", err.message);
            if (err.data) {
                console.error("Chi tiết lỗi validation từ API (JSON):", JSON.stringify(err.data, null, 2));
            }
            setErrorMsg(err.message || 'Lỗi khi tạo đơn hàng.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── STEP 2 → 3: Khởi tạo thanh toán ──────────────────────────────────
    const handleInitiatePayment = async () => {
        if (!createdOrder) return;
        setSubmitting(true);
        setErrorMsg('');
        try {
            const paymentAmount = createdOrder.totalAmount;
            if (paymentMethod === 'VNPAY') {
                const res = await apiClient(`/payments/vnpay/create-url?orderId=${createdOrder.id}&amount=${paymentAmount}`, {
                    method: 'POST'
                });
                if (res.success && res.data) {
                    window.location.href = res.data; // Chuyển sang trang VNPAY
                }
            } else {
                // Các phương thức khác (Demo)
                const res = await apiClient(`/orders/${createdOrder.id}/payments`, {
                    method: 'POST',
                    body: JSON.stringify({ method: paymentMethod, simulateSuccess: true })
                });
                if (res.success) {
                    setPayment(res.data);
                    if (paymentMethod === 'COD') {
                        // Tự động xác nhận thanh toán cho COD
                        const confirmRes = await apiClient(
                            `/orders/${createdOrder.id}/payments/${res.data.id}/confirm?success=true`,
                            { method: 'POST' }
                        );
                        if (confirmRes.success) {
                            setPayment(confirmRes.data || res.data);
                            setPaymentDone(true);
                            clearCart();
                        }
                    }
                    setStep(3);
                }
            }
        } catch (err) {
            console.error("Lỗi khởi tạo thanh toán:", err);
            setErrorMsg(err.message || 'Lỗi khởi tạo thanh toán.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── STEP 3: Xác nhận thanh toán (giả lập các cổng khác) ────────────────────────────
    const handleConfirmPayment = async (success) => {
        if (!payment) return;
        setSubmitting(true);
        setErrorMsg('');
        try {
            const res = await apiClient(
                `/orders/${createdOrder.id}/payments/${payment.id}/confirm?success=${success}`,
                { method: 'POST' }
            );
            if (res.success) {
                setPaymentDone(true);
                if (res.data) {
                    setPayment(res.data);
                }
                if (success) {
                    clearCart();
                }
            }
        } catch (err) {
            console.error("Lỗi xác nhận thanh toán:", err);
            setErrorMsg(err.message || 'Lỗi xác nhận thanh toán.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Order Summary Component ────────────────────────────────────────────
    const OrderSummary = () => {
        const summaryItems = createdOrder?.items || cartItems;
        const summaryTotal = createdOrder ? createdOrder.totalAmount : subtotal;

        return (
            <div className="w-full lg:w-2/5 px-4 lg:px-16 py-12 lg:py-16 bg-[#faf9f7] lg:min-h-screen">
                <div className="max-w-md mx-auto sticky top-16">
                    <h3 className="font-serif text-lg text-charcoal mb-6">Đơn hàng của bạn</h3>
                    <div className="space-y-5 mb-8 max-h-[45vh] overflow-auto pr-2">
                        {summaryItems.map((item, index) => {
                            const isOrderItem = !!createdOrder;
                            const productName = isOrderItem ? item.productName : item.product?.name;
                            const orderType = isOrderItem ? item.orderType || createdOrder.orderType : item.orderType;
                            const size = isOrderItem ? item.size : item.size;
                            const price = isOrderItem ? item.price : item.price;
                            const quantity = isOrderItem ? item.quantity : item.quantity;
                            const imageUrl = isOrderItem ? null : (item.product?.imageUrls?.[0]);

                            return (
                                <div key={item.cartItemId || item.id || index} className="flex items-start gap-4">
                                    <div className="w-16 h-20 bg-gray-100 rounded-sm overflow-hidden border border-black/5 flex-shrink-0 relative">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                                                <span className="text-[10px] text-amber-700/60 font-bold uppercase tracking-wider">Renbo</span>
                                            </div>
                                        )}
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold z-10">{quantity}</span>
                                    </div>
                                    <div className="flex-grow min-w-0 pt-1">
                                        <h4 className="font-serif text-charcoal text-sm truncate">{productName}</h4>
                                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                            <p className="font-medium text-amber-700">
                                                [{orderType === 'RENTAL' ? 'THUÊ' : orderType === 'TAILORING' ? 'MAY ĐO' : 'MUA'}]
                                            </p>
                                            <p>Size: {size}</p>
                                            {orderType === 'RENTAL' && item.rentalStartDate && (
                                                <p className="text-[10px]">{item.rentalStartDate} đến {item.rentalEndDate}</p>
                                            )}
                                            {orderType === 'TAILORING' && item.notes && (
                                                <p className="text-[10px] truncate max-w-[150px]" title={item.notes}>Ghi chú: {item.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-charcoal whitespace-nowrap pt-1">
                                        {((price || 0) * quantity).toLocaleString()} ₫
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border-t border-charcoal/10 pt-6 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500"><span>Tạm tính</span><span>{summaryTotal?.toLocaleString()} ₫</span></div>
                        <div className="flex justify-between text-gray-500"><span>Phí vận chuyển</span><span className="italic text-xs">Miễn phí</span></div>
                        <div className="flex justify-between font-serif text-lg text-charcoal pt-4 border-t border-charcoal/10">
                            <span>Tổng cộng</span>
                            <span>{summaryTotal?.toLocaleString()} ₫</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row">
            {/* LEFT: Main content */}
            <div className="w-full lg:w-3/5 px-4 lg:px-20 py-12 lg:py-16 bg-white border-r border-gray-100">
                <div className="max-w-xl mx-auto">
                    {/* Brand + Back */}
                    <div className="flex items-center justify-between mb-10">
                        <Link to="/" className="font-sans text-xs font-bold tracking-[0.2em] text-amber-700 uppercase">Renbo Bridal</Link>
                        <Link to="/cart" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-charcoal transition-colors">
                            <ChevronLeft size={14} /> Giỏ hàng
                        </Link>
                    </div>

                    {/* Step Indicator */}
                    <nav className="flex items-center gap-2 text-xs uppercase tracking-widest mb-10">
                        {STEPS.map((s, i) => (
                            <React.Fragment key={i}>
                                <span className={`font-bold ${step === i + 1 ? 'text-charcoal' : step > i + 1 ? 'text-emerald-600' : 'text-gray-300'}`}>
                                    {step > i + 1 ? <CheckCircle2 size={14} className="inline mr-1" /> : null}{s}
                                </span>
                                {i < STEPS.length - 1 && <span className="text-gray-200">/</span>}
                            </React.Fragment>
                        ))}
                    </nav>

                    {/* Error */}
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded">
                            {errorMsg}
                        </div>
                    )}

                    {/* ── STEP 1: Thông tin giao hàng ── */}
                    {loadingOrder ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-pulse">
                            <Loader2 className="animate-spin text-amber-700 mb-3" size={28} />
                            <span className="text-xs uppercase tracking-wider font-bold">Đang tải thông tin đơn hàng...</span>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                            <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleCreateOrder} className="space-y-8">
                                <section>
                                    <div className="flex justify-between items-center mb-5">
                                        <h2 className="font-serif text-xl text-charcoal">Liên hệ</h2>
                                        <span className="text-xs text-gray-400">Đã có tài khoản? <Link to="/login" className="underline hover:text-charcoal">Đăng nhập</Link></span>
                                    </div>
                                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInput} required
                                        className="w-full p-4 bg-transparent border border-gray-200 focus:border-charcoal outline-none transition-colors rounded-sm text-sm" />
                                </section>

                                <section>
                                    <h2 className="font-serif text-xl text-charcoal mb-5">Địa chỉ giao hàng</h2>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" name="firstName" placeholder="Họ" value={formData.firstName} onChange={handleInput} required
                                                className="p-4 bg-transparent border border-gray-200 focus:border-charcoal outline-none transition-colors rounded-sm text-sm" />
                                            <input type="text" name="lastName" placeholder="Tên" value={formData.lastName} onChange={handleInput} required
                                                className="p-4 bg-transparent border border-gray-200 focus:border-charcoal outline-none transition-colors rounded-sm text-sm" />
                                        </div>
                                        <input type="text" name="address" placeholder="Địa chỉ" value={formData.address} onChange={handleInput} required
                                            className="w-full p-4 bg-transparent border border-gray-200 focus:border-charcoal outline-none transition-colors rounded-sm text-sm" />
                                        <input type="text" name="city" placeholder="Thành phố / Tỉnh" value={formData.city} onChange={handleInput} required
                                            className="w-full p-4 bg-transparent border border-gray-200 focus:border-charcoal outline-none transition-colors rounded-sm text-sm" />
                                        <input type="tel" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleInput} required
                                            className="w-full p-4 bg-transparent border border-gray-200 focus:border-charcoal outline-none transition-colors rounded-sm text-sm" />
                                    </div>
                                </section>

                                <div className="flex justify-end pt-4">
                                    <button type="submit" disabled={submitting || cartItems.length === 0}
                                        className="flex items-center gap-2 bg-charcoal text-white px-8 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-amber-700 transition-all duration-300 disabled:opacity-60">
                                        {submitting ? <Loader2 className="animate-spin" size={15} /> : null}
                                        Tiếp theo → Thanh toán
                                    </button>
                                </div>
                            </motion.form>
                        ) : step === 2 ? (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div>
                                    <h2 className="font-serif text-xl text-charcoal mb-1">Phương thức thanh toán</h2>
                                    <p className="text-xs text-gray-400">Chọn cách bạn muốn thanh toán đơn hàng #{createdOrder?.id}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {PAYMENT_METHODS.map(({ id, label, desc, icon: Icon, badge }) => (
                                        <button key={id} type="button" onClick={() => setPaymentMethod(id)}
                                            className={`relative text-left p-5 border-2 rounded-xl transition-all duration-200 ${
                                                paymentMethod === id
                                                    ? 'border-amber-500 bg-amber-50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}>
                                            {badge && (
                                                <span className="absolute top-3 right-3 text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">{badge}</span>
                                            )}
                                            <Icon size={22} className={`mb-2 ${paymentMethod === id ? 'text-amber-600' : 'text-gray-400'}`} />
                                            <div className={`font-bold text-sm ${paymentMethod === id ? 'text-amber-700' : 'text-gray-700'}`}>{label}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setStep(1)}
                                        className="flex items-center gap-1.5 px-6 py-3 border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-600 rounded hover:bg-gray-50 transition-colors">
                                        <ChevronLeft size={14} /> Quay lại
                                    </button>
                                    <button onClick={handleInitiatePayment} disabled={submitting}
                                        className="flex-1 flex items-center justify-center gap-2 bg-charcoal text-white py-3 uppercase tracking-[0.15em] text-xs font-bold hover:bg-amber-700 transition-all duration-300 rounded disabled:opacity-60">
                                        {submitting ? <Loader2 className="animate-spin" size={15} /> : null}
                                        Thanh toán {paymentAmount.toLocaleString()} ₫
                                    </button>
                                </div>
                            </motion.div>
                        ) : step === 3 ? (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                {!paymentDone ? (
                                    <>
                                        <div>
                                            <h2 className="font-serif text-xl text-charcoal mb-1">Xác nhận thanh toán</h2>
                                            <p className="text-xs text-gray-400">Phương thức: <strong>{paymentMethod}</strong> · Đơn #{createdOrder?.id}</p>
                                        </div>

                                        {/* Gateway info */}
                                        {payment?.gatewayInfo && (
                                            <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl space-y-4">
                                                {payment.gatewayInfo.qrCodeUrl && (
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Quét mã QR để chuyển khoản</p>
                                                        <img src={payment.gatewayInfo.qrCodeUrl} alt="VietQR Code"
                                                            className="mx-auto w-52 h-52 object-contain rounded-lg border border-amber-200 bg-white p-2" />
                                                    </div>
                                                )}
                                                {payment.gatewayInfo.deeplink && (
                                                    <a href={payment.gatewayInfo.deeplink}
                                                        className="block w-full text-center bg-[#ae2070] text-white py-3 rounded-xl font-bold text-sm">
                                                        🟣 Mở ứng dụng MoMo
                                                    </a>
                                                )}
                                                {payment.gatewayInfo.approvalUrl && (
                                                    <a href={payment.gatewayInfo.approvalUrl} target="_blank" rel="noreferrer"
                                                        className="block w-full text-center bg-[#0070ba] text-white py-3 rounded-xl font-bold text-sm">
                                                        🔵 Thanh toán qua PayPal
                                                    </a>
                                                )}
                                                <p className="text-sm text-gray-600 text-center">{payment.gatewayInfo.instruction}</p>
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-400 text-center italic">
                                            Demo: Nhấn "Thanh toán thành công" để giả lập gateway callback
                                        </p>

                                        <div className="flex gap-3">
                                            <button onClick={() => handleConfirmPayment(false)} disabled={submitting}
                                                className="flex-1 py-3 border-2 border-red-200 text-red-500 text-xs font-bold uppercase rounded hover:bg-red-50 transition-colors disabled:opacity-50">
                                                ✕ Hủy / Thất bại
                                            </button>
                                            <button onClick={() => handleConfirmPayment(true)} disabled={submitting}
                                                className="flex-[2] flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 text-xs font-bold uppercase rounded hover:bg-emerald-700 transition-colors disabled:opacity-50">
                                                {submitting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                                                Thanh toán thành công
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* Kết quả cuối */
                                    <div className="text-center py-8 space-y-5">
                                        {payment?.status === 'COMPLETED' || paymentMethod === 'COD' ? (
                                            <>
                                                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                                                    <CheckCircle2 className="text-emerald-500" size={44} />
                                                </div>
                                                <div>
                                                    <h2 className="font-serif text-2xl text-charcoal">Đặt hàng thành công!</h2>
                                                    <p className="text-gray-500 text-sm mt-2">
                                                        Đơn hàng #{createdOrder?.id} đã được xác nhận.<br />
                                                        Email xác nhận đã được gửi đến bạn.
                                                    </p>
                                                </div>
                                                <button onClick={() => navigate('/profile')}
                                                    className="inline-block bg-charcoal text-white px-8 py-3 uppercase tracking-[0.15em] text-xs font-bold hover:bg-amber-700 transition-all rounded">
                                                    Xem đơn hàng →
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                                                    <span className="text-red-500 text-4xl">✕</span>
                                                </div>
                                                <h2 className="font-serif text-2xl text-charcoal">Thanh toán thất bại</h2>
                                                <p className="text-gray-500 text-sm">Đơn hàng #{createdOrder?.id} vẫn ở trạng thái chờ. Bạn có thể thử lại.</p>
                                                <button onClick={() => { setStep(2); setPaymentDone(false); }}
                                                    className="inline-block border border-charcoal text-charcoal px-8 py-3 uppercase tracking-[0.15em] text-xs font-bold hover:bg-charcoal hover:text-white transition-all rounded">
                                                    Thử lại
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                    )}

                    <div className="mt-12 pt-6 border-t border-gray-100 flex items-center gap-2 text-gray-300 justify-center">
                        <Lock size={12} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Thanh toán bảo mật</span>
                    </div>
                </div>
            </div>

            {/* RIGHT: Order Summary */}
            <OrderSummary />
        </div>
    );
};

export default Checkout;
