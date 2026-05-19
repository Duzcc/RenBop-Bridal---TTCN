import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, ShoppingBag, LogOut, Calendar, Ruler, ChevronDown, ChevronUp, Shield, Key, Loader2, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/apiClient';

const FEMALE_FIELDS = [
    { key: 'bust',      label: 'Vòng ngực', unit: 'cm' },
    { key: 'waist',     label: 'Vòng eo',   unit: 'cm' },
    { key: 'hip',       label: 'Vòng hông', unit: 'cm' },
    { key: 'shoulder',  label: 'Vai',       unit: 'cm' },
    { key: 'armLength', label: 'Dài tay',   unit: 'cm' },
];

const MALE_FIELDS = [
    { key: 'shoulder',  label: 'Vai',       unit: 'cm' },
    { key: 'bust',      label: 'Vòng ngực', unit: 'cm' },
    { key: 'waist',     label: 'Vòng eo',   unit: 'cm' },
    { key: 'armLength', label: 'Dài tay',   unit: 'cm' },
];

const formatDate = (iso) => {
    if (!iso) return '';
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
};

// Single measurement card
const MeasurementCard = ({ data }) => {
    const isMale = data.gender === 'MALE';
    const fields = isMale ? MALE_FIELDS : FEMALE_FIELDS;

    return (
        <div className={`rounded-xl border p-4 ${isMale ? 'border-blue-100 bg-blue-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={`text-base font-bold ${isMale ? 'text-blue-400' : 'text-rose-400'}`}>
                        {isMale ? '♂' : '♀'}
                    </span>
                    <span className={`text-xs font-semibold font-sans ${isMale ? 'text-blue-600' : 'text-rose-500'}`}>
                        {isMale ? 'Nam' : 'Nữ'}
                    </span>
                    {data.label && (
                        <span className="text-xs text-charcoal-light font-sans">— {data.label}</span>
                    )}
                </div>
                {data.createdAt && (
                    <span className="text-xs text-charcoal-light/60 font-sans">{formatDate(data.createdAt)}</span>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {fields.map(({ key, label, unit }) => (
                    data[key] != null && (
                        <div key={key} className="bg-white/70 rounded-lg p-3 text-center border border-white">
                            <p className="font-serif text-xl text-charcoal">{data[key]}<span className="text-xs text-charcoal-light ml-0.5">{unit}</span></p>
                            <p className="text-xs text-charcoal-light font-sans mt-0.5">{label}</p>
                        </div>
                    )
                ))}
            </div>

            {data.note && (
                <div className="mt-3 p-2.5 bg-white/60 rounded-lg">
                    <p className="text-xs text-charcoal-light font-sans font-semibold uppercase tracking-wider mb-1">Ghi chú</p>
                    <p className="text-sm text-charcoal font-sans">{data.note}</p>
                </div>
            )}
        </div>
    );
};

const Profile = () => {
    const { user, logout, set2FaEnabledState } = useAuth();
    const [measurements, setMeasurements] = useState([]);
    const [measureLoading, setMeasureLoading] = useState(true);
    const [showMeasure, setShowMeasure] = useState(false);
    
    // Security States
    const [showSecurity, setShowSecurity] = useState(false);
    const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
    const [pwStatus, setPwStatus] = useState({ loading: false, msg: '', type: '' });
    const [twoFaLoading, setTwoFaLoading] = useState(false);

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).slice(-2).join('').toUpperCase()
        : '?';

    useEffect(() => {
        if (!user?.id) return;
        const fetch = async () => {
            try {
                const res = await apiClient(`/measurements/user/${user.id}`);
                if (res?.data) setMeasurements(res.data);
            } catch {
                // no measurements
            } finally {
                setMeasureLoading(false);
            }
        };
        fetch();
    }, [user?.id]);

    const femaleMeasurements = measurements.filter(m => m.gender !== 'MALE');
    const maleMeasurements = measurements.filter(m => m.gender === 'MALE');

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwStatus({ loading: true, msg: '', type: '' });
        
        if (pwForm.newPassword !== pwForm.confirm) {
            return setPwStatus({ loading: false, msg: 'Mật khẩu xác nhận không khớp', type: 'error' });
        }
        
        try {
            const res = await apiClient('/auth/me/password', {
                method: 'PUT',
                body: JSON.stringify({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword })
            });
            if (res.success) {
                setPwStatus({ loading: false, msg: 'Đổi mật khẩu thành công!', type: 'success' });
                setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
            } else {
                setPwStatus({ loading: false, msg: res.message || 'Lỗi khi đổi mật khẩu', type: 'error' });
            }
        } catch (error) {
            setPwStatus({ loading: false, msg: error.message || 'Sai mật khẩu hiện tại', type: 'error' });
        }
    };

    const handleToggle2Fa = async () => {
        setTwoFaLoading(true);
        const nextState = !user.is2FaEnabled;
        try {
            const res = await apiClient(`/auth/2fa/enable?enable=${nextState}`, { method: 'POST' });
            if (res.success) {
                set2FaEnabledState(nextState);
            }
        } catch (error) {
            alert(error.message || 'Lỗi khi cập nhật 2FA');
        } finally {
            setTwoFaLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ivory pt-32 pb-20 px-4">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Header card */}
                    <div className="glass rounded-2xl p-8 mb-6 flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-champagne/20 border-2 border-champagne/40 flex items-center justify-center flex-shrink-0">
                            <span className="font-serif text-2xl text-champagne">{initials}</span>
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <h2 className="font-serif text-2xl text-charcoal">{user?.name}</h2>
                            <p className="text-charcoal-light font-sans text-sm mt-1">{user?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 font-sans text-sm text-charcoal hover:border-red-300 hover:text-red-500 transition-colors"
                        >
                            <LogOut size={15} />Đăng xuất
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {[
                            { icon: ShoppingBag, label: 'Đơn hàng', value: '0' },
                            { icon: Calendar, label: 'Lịch hẹn thử đồ', value: '0' },
                            { icon: Ruler, label: 'Số đo', value: measurements.length },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="glass rounded-xl p-5 text-center">
                                <Icon size={22} className="text-champagne mx-auto mb-2" strokeWidth={1.5} />
                                <p className="font-serif text-2xl text-charcoal">{value}</p>
                                <p className="text-xs text-charcoal-light font-sans mt-1">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Measurements */}
                    <div className="glass rounded-2xl mb-6 overflow-hidden">
                        <button
                            onClick={() => setShowMeasure(!showMeasure)}
                            className="w-full flex items-center justify-between p-6 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Ruler size={20} className="text-champagne" strokeWidth={1.5} />
                                <h3 className="font-serif text-lg text-charcoal">Số đo của tôi</h3>
                                {measurements.length > 0 && (
                                    <span className="text-xs bg-champagne/20 text-champagne px-2 py-0.5 rounded-full font-sans">
                                        {measurements.length} lần đo
                                    </span>
                                )}
                            </div>
                            {showMeasure ? <ChevronUp size={18} className="text-charcoal-light" /> : <ChevronDown size={18} className="text-charcoal-light" />}
                        </button>

                        <AnimatePresence initial={false}>
                            {showMeasure && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="px-6 pb-6">
                                        {measureLoading ? (
                                            <div className="text-center py-8 text-charcoal-light font-sans text-sm">Đang tải...</div>
                                        ) : measurements.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 bg-champagne/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Ruler size={28} className="text-champagne/60" strokeWidth={1.5} />
                                                </div>
                                                <p className="text-sm text-charcoal-light font-sans mb-1">Chưa có số đo</p>
                                                <p className="text-xs text-charcoal-light/60 font-sans">Số đo sẽ được nhân viên nhập khi bạn đến thử đồ tại cửa hàng</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {femaleMeasurements.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-sans font-semibold tracking-widest uppercase text-rose-400 mb-2 flex items-center gap-1">
                                                            <span className="text-sm">♀</span> Số đo Nữ
                                                        </p>
                                                        <div className="space-y-3">
                                                            {femaleMeasurements.map(m => <MeasurementCard key={m.id} data={m} />)}
                                                        </div>
                                                    </div>
                                                )}
                                                {maleMeasurements.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-sans font-semibold tracking-widest uppercase text-blue-400 mb-2 flex items-center gap-1">
                                                            <span className="text-sm">♂</span> Số đo Nam
                                                        </p>
                                                        <div className="space-y-3">
                                                            {maleMeasurements.map(m => <MeasurementCard key={m.id} data={m} />)}
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-xs text-charcoal-light/50 font-sans text-center pt-2">
                                                    Để cập nhật số đo, vui lòng liên hệ nhân viên tại cửa hàng.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Security & Settings */}
                    <div className="glass rounded-2xl mb-6 overflow-hidden">
                        <button
                            onClick={() => setShowSecurity(!showSecurity)}
                            className="w-full flex items-center justify-between p-6 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-champagne" strokeWidth={1.5} />
                                <h3 className="font-serif text-lg text-charcoal">Cài đặt Bảo mật</h3>
                            </div>
                            {showSecurity ? <ChevronUp size={18} className="text-charcoal-light" /> : <ChevronDown size={18} className="text-charcoal-light" />}
                        </button>

                        <AnimatePresence initial={false}>
                            {showSecurity && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="px-6 pb-6 space-y-6">
                                        {/* 2FA Toggle */}
                                        <div className="bg-white/50 border border-white/60 rounded-xl p-5 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-sans text-sm font-bold text-charcoal flex items-center gap-2 mb-1">
                                                    <Smartphone size={16} className="text-blue-500" />Xác thực 2 bước (2FA)
                                                </h4>
                                                <p className="text-xs text-charcoal-light font-sans">
                                                    Nhận mã OTP qua email mỗi khi đăng nhập để tăng cường bảo mật.
                                                </p>
                                            </div>
                                            <button 
                                                onClick={handleToggle2Fa}
                                                disabled={twoFaLoading}
                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user?.is2FaEnabled ? 'bg-champagne' : 'bg-gray-300'} disabled:opacity-50`}
                                            >
                                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user?.is2FaEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>

                                        {/* Change Password */}
                                        <div className="bg-white/50 border border-white/60 rounded-xl p-5">
                                            <h4 className="font-sans text-sm font-bold text-charcoal flex items-center gap-2 mb-4">
                                                <Key size={16} className="text-champagne" />Đổi mật khẩu
                                            </h4>
                                            {pwStatus.msg && (
                                                <div className={`p-3 text-xs mb-4 rounded-lg border ${pwStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                                                    {pwStatus.msg}
                                                </div>
                                            )}
                                            <form onSubmit={handlePasswordChange} className="space-y-3">
                                                <div>
                                                    <label className="text-xs text-charcoal-light font-sans font-semibold">Mật khẩu hiện tại</label>
                                                    <input type="password" required value={pwForm.oldPassword} onChange={e => setPwForm({...pwForm, oldPassword: e.target.value})}
                                                        className="w-full mt-1 p-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-champagne focus:ring-1 focus:ring-champagne" />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs text-charcoal-light font-sans font-semibold">Mật khẩu mới</label>
                                                        <input type="password" required value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})}
                                                            className="w-full mt-1 p-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-champagne focus:ring-1 focus:ring-champagne" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-charcoal-light font-sans font-semibold">Xác nhận mật khẩu mới</label>
                                                        <input type="password" required value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})}
                                                            className="w-full mt-1 p-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-champagne focus:ring-1 focus:ring-champagne" />
                                                    </div>
                                                </div>
                                                <button disabled={pwStatus.loading} type="submit" className="px-5 py-2.5 bg-charcoal text-white text-xs font-sans tracking-widest uppercase rounded-lg hover:bg-champagne transition-colors mt-2 flex items-center justify-center gap-2">
                                                    {pwStatus.loading && <Loader2 size={14} className="animate-spin" />}
                                                    Lưu mật khẩu mới
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Info card */}
                    <div className="glass rounded-2xl p-8">
                        <h3 className="font-serif text-lg text-charcoal mb-5">Thông tin tài khoản</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-white/30">
                                <span className="text-xs font-sans font-semibold tracking-widest uppercase text-charcoal-light">Họ tên</span>
                                <span className="font-sans text-sm text-charcoal">{user?.name}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-white/30">
                                <span className="text-xs font-sans font-semibold tracking-widest uppercase text-charcoal-light">Email</span>
                                <span className="font-sans text-sm text-charcoal">{user?.email}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-xs font-sans font-semibold tracking-widest uppercase text-charcoal-light">ID</span>
                                <span className="font-sans text-xs text-charcoal-light font-mono">{user?.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link to="/collections/all" className="inline-block px-8 py-3.5 bg-charcoal text-ivory font-sans text-sm font-medium tracking-widest uppercase rounded-xl hover:bg-champagne transition-colors duration-300">
                            Khám phá bộ sưu tập
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
