import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getPasswordStrength, validatePassword } from '../utils/authUtils';

const Register = () => {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [pwStrength, setPwStrength] = useState({ score: 0, label: '', color: '' });
    const [pwErrors, setPwErrors] = useState([]);

    useEffect(() => {
        if (isAuthenticated) navigate('/', { replace: true });
    }, [isAuthenticated, navigate]);

    // Cập nhật strength khi password thay đổi
    useEffect(() => {
        setPwStrength(getPasswordStrength(form.password));
        setPwErrors(form.password ? validatePassword(form.password) : []);
    }, [form.password]);

    const validate = () => {
        const errs = {};
        if (!form.name || form.name.trim().length < 2) errs.name = 'Họ tên phải có ít nhất 2 ký tự';
        if (!form.email) errs.email = 'Vui lòng nhập email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email không hợp lệ';
        if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
        else if (validatePassword(form.password).length > 0) errs.password = 'Mật khẩu chưa đủ mạnh';
        if (!form.confirmPassword) errs.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        setServerError('');
        const result = await register(form);
        if (result.success) {
            navigate('/', { replace: true });
        } else {
            setServerError(result.error);
        }
        setIsLoading(false);
    };

    const strengthSegments = 5;
    const filledSegments = pwStrength.score;

    const requirements = [
        { label: 'Ít nhất 8 ký tự', met: form.password.length >= 8 },
        { label: 'Chữ hoa và thường', met: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) },
        { label: 'Có chữ số', met: /[0-9]/.test(form.password) },
        { label: 'Ký tự đặc biệt', met: /[^A-Za-z0-9]/.test(form.password) },
    ];

    return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-4 py-12">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-champagne/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-champagne/10 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md"
            >
                <div className="glass rounded-2xl shadow-2xl p-8 md:p-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block">
                            <h1 className="font-serif text-3xl text-charcoal hover:text-champagne transition-colors">
                                RENBOP BRIDAL
                            </h1>
                        </Link>
                        <p className="mt-2 text-sm text-charcoal-light font-sans">Tạo tài khoản mới</p>
                    </div>

                    {/* Server error */}
                    {serverError && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2"
                        >
                            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-600">{serverError}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        {/* Full name */}
                        <div>
                            <label className="block text-xs font-sans font-semibold tracking-widest uppercase text-charcoal mb-2">
                                Họ và tên
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" />
                                <input
                                    type="text"
                                    id="register-name"
                                    autoComplete="name"
                                    value={form.name}
                                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                                    placeholder="Nguyễn Thị Lan"
                                    className={`w-full pl-11 pr-4 py-3 bg-white/60 border rounded-xl text-sm font-sans text-charcoal placeholder-charcoal-light/50 outline-none transition-all focus:ring-2 focus:ring-champagne/40 focus:border-champagne ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-sans font-semibold tracking-widest uppercase text-charcoal mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" />
                                <input
                                    type="email"
                                    id="register-email"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); setServerError(''); }}
                                    placeholder="your@email.com"
                                    className={`w-full pl-11 pr-4 py-3 bg-white/60 border rounded-xl text-sm font-sans text-charcoal placeholder-charcoal-light/50 outline-none transition-all focus:ring-2 focus:ring-champagne/40 focus:border-champagne ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-sans font-semibold tracking-widest uppercase text-charcoal mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="register-password"
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                                    placeholder="••••••••"
                                    className={`w-full pl-11 pr-12 py-3 bg-white/60 border rounded-xl text-sm font-sans text-charcoal placeholder-charcoal-light/50 outline-none transition-all focus:ring-2 focus:ring-champagne/40 focus:border-champagne ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                                />
                                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-champagne transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Password strength bar */}
                            {form.password && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        {Array.from({ length: strengthSegments }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 h-1.5 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: i < filledSegments ? pwStrength.color : '#e5e7eb',
                                                }}
                                            />
                                        ))}
                                        {pwStrength.label && (
                                            <span className="text-xs font-medium ml-1" style={{ color: pwStrength.color }}>
                                                {pwStrength.label}
                                            </span>
                                        )}
                                    </div>
                                    {/* Requirements */}
                                    <div className="grid grid-cols-2 gap-1">
                                        {requirements.map((req) => (
                                            <div key={req.label} className="flex items-center gap-1.5">
                                                <CheckCircle2
                                                    size={12}
                                                    className={req.met ? 'text-green-500' : 'text-gray-300'}
                                                />
                                                <span className={`text-xs ${req.met ? 'text-green-600' : 'text-charcoal-light'}`}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block text-xs font-sans font-semibold tracking-widest uppercase text-charcoal mb-2">
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    id="register-confirm-password"
                                    autoComplete="new-password"
                                    value={form.confirmPassword}
                                    onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: '' }); }}
                                    placeholder="••••••••"
                                    className={`w-full pl-11 pr-12 py-3 bg-white/60 border rounded-xl text-sm font-sans text-charcoal placeholder-charcoal-light/50 outline-none transition-all focus:ring-2 focus:ring-champagne/40 focus:border-champagne ${errors.confirmPassword ? 'border-red-400' : form.confirmPassword && form.password === form.confirmPassword ? 'border-green-400' : 'border-gray-200'}`}
                                />
                                <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-champagne transition-colors">
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>}
                            {form.confirmPassword && form.password === form.confirmPassword && !errors.confirmPassword && (
                                <p className="mt-1.5 text-xs text-green-500 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Mật khẩu khớp
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            id="register-submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-charcoal text-ivory font-sans text-sm font-medium tracking-widest uppercase rounded-xl hover:bg-champagne transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Đang tạo tài khoản...
                                </>
                            ) : (
                                'Đăng ký'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-charcoal-light font-sans">đã có tài khoản?</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <p className="text-center text-sm font-sans text-charcoal-light">
                        <Link
                            to="/login"
                            className="text-champagne font-semibold hover:underline underline-offset-2"
                        >
                            ← Đăng nhập
                        </Link>
                    </p>
                </div>

                <p className="text-center mt-6 text-xs text-charcoal-light font-sans">
                    <Link to="/" className="hover:text-champagne transition-colors">
                        ← Quay về trang chủ
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
