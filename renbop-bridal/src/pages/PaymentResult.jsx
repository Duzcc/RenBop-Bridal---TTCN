import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const { clearCart } = useCart();

    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        if (success === 'true') {
            setStatus('success');
            clearCart();
        } else {
            setStatus('error');
        }
    }, [success, clearCart]);

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center bg-ivory">Đang xử lý kết quả thanh toán...</div>;
    }

    return (
        <div className="min-h-screen bg-ivory pt-32 pb-24 px-4 flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white p-8 text-center shadow-sm border border-gray-100"
            >
                {status === 'success' ? (
                    <>
                        <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            transition={{ type: 'spring', bounce: 0.5 }}
                            className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle className="text-green-500 w-10 h-10" />
                        </motion.div>
                        <h1 className="font-serif text-3xl text-charcoal mb-4">Thanh Toán Thành Công</h1>
                        <p className="text-gray-500 text-sm mb-6">
                            Đơn hàng #{orderId} của bạn đã được thanh toán thành công qua VNPAY. 
                            Chúng tôi đã gửi email xác nhận chi tiết đến bạn.
                        </p>
                    </>
                ) : (
                    <>
                        <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            transition={{ type: 'spring', bounce: 0.5 }}
                            className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <XCircle className="text-red-500 w-10 h-10" />
                        </motion.div>
                        <h1 className="font-serif text-3xl text-charcoal mb-4">Thanh Toán Thất Bại</h1>
                        <p className="text-gray-500 text-sm mb-6">
                            Rất tiếc, giao dịch cho đơn hàng #{orderId} của bạn đã thất bại hoặc bị hủy bỏ. Vui lòng thử lại.
                        </p>
                    </>
                )}

                <div className="space-y-4 mt-8">
                    <Link to="/profile" className="block w-full py-4 bg-charcoal text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">
                        Xem Đơn Hàng Của Tôi
                    </Link>
                    <Link to="/products" className="block w-full py-4 bg-white text-charcoal border border-charcoal text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">
                        Tiếp Tục Mua Sắm
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentResult;
