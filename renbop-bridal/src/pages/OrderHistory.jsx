import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import { Package, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_MAP = {
    PENDING:     { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    CONFIRMED:   { label: 'Đã xác nhận',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
    SHIPPED:     { label: 'Đang giao',     color: 'bg-purple-100 text-purple-700 border-purple-200' },
    DELIVERED:   { label: 'Đã giao hàng', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    CANCELLED:   { label: 'Đã hủy',        color: 'bg-red-100 text-red-700 border-red-200' },
    IN_PROGRESS: { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    COMPLETED:   { label: 'Đã hoàn thành', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};


const OrderHistory = () => {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [expanded, setExpanded] = useState(null); // ID của đơn đang mở detail

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await apiClient('/orders/me');
                if (res.success) setOrders(res.data?.content || res.data || []);
            } catch (err) {
                setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-gray-300" size={40} />
        </div>
    );

    if (error) return (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
    );

    if (orders.length === 0) return (
        <div className="text-center py-20 space-y-5">
            <ShoppingBag className="mx-auto text-gray-200" size={60} />
            <p className="text-gray-400 text-sm">Bạn chưa có đơn hàng nào.</p>
            <Link to="/collections/all"
                className="inline-block bg-charcoal text-white px-7 py-3 text-xs uppercase tracking-widest font-bold hover:bg-amber-700 transition-colors rounded">
                Mua sắm ngay →
            </Link>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
            <div className="flex items-center gap-3 mb-8">
                <Package className="text-amber-600" size={24} />
                <h1 className="font-serif text-2xl text-charcoal">Lịch sử đơn hàng</h1>
                <span className="ml-auto text-xs text-gray-400 font-medium">{orders.length} đơn</span>
            </div>

            {orders.map((order, idx) => {
                const cfg  = STATUS_MAP[order.status] || { label: order.status || 'Chưa rõ', color: 'bg-gray-100 text-gray-700 border-gray-200' };
                const open = expanded === order.id;

                return (
                    <motion.div key={order.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

                        {/* Row header */}
                        <button onClick={() => setExpanded(open ? null : order.id)}
                            className="w-full flex items-center gap-4 px-6 py-5 hover:bg-gray-50/60 transition-colors text-left">

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="font-semibold text-gray-900 text-sm">Đơn #{order.id}</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
                                        {cfg.label}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                        year: 'numeric', month: 'long', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                    {' · '}
                                    {(order.items || []).length} sản phẩm
                                </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <div className="font-bold text-charcoal text-sm">{order.totalAmount?.toLocaleString()} ₫</div>
                            </div>

                            <ChevronRight size={16} className={`text-gray-300 transition-transform flex-shrink-0 ${open ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Expandable detail */}
                        {open && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100 px-6 py-5 bg-gray-50/40 space-y-4">

                                {/* Items */}
                                <div className="space-y-3">
                                    {(order.items || []).map(item => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="w-10 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                                <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100"/>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-800 truncate">{item.productName}</div>
                                                <div className="text-xs text-gray-400">x{item.quantity}</div>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                                                {(item.price * item.quantity).toLocaleString()} ₫
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping address */}
                                <div className="text-xs text-gray-500 bg-white border border-gray-100 rounded-lg px-4 py-3">
                                    <span className="font-semibold text-gray-700">Địa chỉ giao hàng: </span>
                                    {order.shippingAddress}
                                </div>

                                {/* Note */}
                                {order.note && (
                                    <div className="text-xs text-gray-400 italic">
                                        Ghi chú: {order.note}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-1">
                                    {order.status === 'PENDING' && (
                                        <Link to={`/checkout?orderId=${order.id}`}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-amber-700 transition-colors">
                                            Thanh toán ngay →
                                        </Link>
                                    )}
                                    <div className={`ml-auto px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border ${cfg.color}`}>
                                        {cfg.label}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};

export default OrderHistory;
