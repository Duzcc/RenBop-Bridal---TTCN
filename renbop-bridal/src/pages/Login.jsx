import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

const Login = () => {
    const { login, verify2Fa, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    // 2FA state
    const [step, setStep] = useState('login'); // 'login' | '2fa'
    const [tempToken, setTempToken] = useState('');
    const [otpCode, setOtpCode] = useState('');

    // Rate limiting
    const [attempts, setAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState(null);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (isAuthenticated) navigate(redirect, { replace: true });
    }, [isAuthenticated, navigate, redirect]);

    useEffect(() => {
        if (!lockoutUntil) return;
        const interval = setInterval(() => {
            const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
            if (remaining <= 0) {
                setLockoutUntil(null);
                setCountdown(0);
                setAttempts(0);
                clearInterval(interval);
            } else {
                setCountdown(remaining);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [lockoutUntil]);

    const isLocked = lockoutUntil && Date.now() < lockoutUntil;

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = 'Vui lòng nhập email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email không hợp lệ';
        if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLocked) return;
        if (!validate()) return;

        setIsLoading(true);
        setServerError('');

        const result = await login({ email: form.email, password: form.password });

        if (result.success) {
            if (result.requires2Fa) {
                setTempToken(result.tempToken);
                setStep('2fa');
            } else {
                const finalRedirect = result.role === 'ADMIN' ? '/admin' : redirect;
                navigate(finalRedirect, { replace: true });
            }
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setServerError(result.error);
            if (result.code === 'ACCOUNT_LOCKED') {
                setLockoutUntil(Date.now() + 15 * 60 * 1000);
                setCountdown(15 * 60);
            } else if (newAttempts >= MAX_ATTEMPTS) {
                setLockoutUntil(Date.now() + LOCKOUT_SECONDS * 1000);
                setCountdown(LOCKOUT_SECONDS);
            }
        }
        setIsLoading(false);
    };

    const handleVerify2Fa = async (e) => {
        e.preventDefault();
        if (!otpCode || otpCode.length !== 6) {
            setServerError('Vui lòng nhập đủ 6 số OTP');
            return;
        }
        setIsLoading(true);
        setServerError('');
        const result = await verify2Fa({ tempToken, code: otpCode });
        if (result.success) {
            const finalRedirect = result.role === 'ADMIN' ? '/admin' : redirect;
            navigate(finalRedirect, { replace: true });
        } else {
            setServerError(result.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
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
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block">
                            <h1 className="font-serif text-3xl text-charcoal hover:text-champagne transition-colors">
                                RENBOP BRIDAL
                            </h1>
                        </Link>
                        <p className="mt-2 text-sm text-charcoal-light font-sans">
                            {step === '2fa' ? 'Xác thực 2 lớp' : 'Đăng nhập tài khoản'}
                        </p>
                    </div>

                    {/* Lockout warning */}
                    {isLocked && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3"
                        >
                            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-red-700">Tài khoản tạm thời bị khóa</p>
                                <p className="text-xs text-red-600 mt-0.5">
                                    Thử lại sau <span className="font-bold">{countdown}s</span>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Server error */}
                    {serverError && !isLocked && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2"
                        >
                            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-600">{serverError}</p>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 'login' ? (
                            <motion.form
                                key="login-form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                noValidate
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-xs font-sans font-semibold tracking-widest uppercase text-charcoal mb-2">Email</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" />
                                        <input
                                            type="email"
                                            id="login-email"
                                            autoComplete="email"
                                            value={form.email}
                                            onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); setServerError(''); }}
                                            disabled={isLocked}
                                            placeholder="your@email.com"
                                            className={`w-full pl-11 pr-4 py-3 bg-white/60 border rounded-xl text-sm font-sans text-charcoal placeholder-charcoal-light/50 outline-none transition-all focus:ring-2 focus:ring-champagne/40 focus:border-champagne disabled:opacity-50 ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-sans font-semibold tracking-widest uppercase text-charcoal mb-2">Mật khẩu</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="login-password"
                                            autoComplete="current-password"
                                            value={form.password}
                                            onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); setServerError(''); }}
                                            disabled={isLocked}
                                            placeholder="••••••••"
                                            className={`w-full pl-11 pr-12 py-3 bg-white/60 border rounded-xl text-sm font-sans text-charcoal placeholder-charcoal-light/50 outline-none transition-all focus:ring-2 focus:ring-champagne/40 focus:border-champagne disabled:opacity-50 ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                                        />
                                        <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-champagne transition-colors">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
                                    {attempts > 0 && !isLocked && (
                                        <p className="mt-1.5 text-xs text-amber-600">Lần thử {attempts}/{MAX_ATTEMPTS}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    id="login-submit"
                                    disabled={isLoading || isLocked}
                                    className="w-full py-3.5 bg-charcoal text-ivory font-sans text-sm font-medium tracking-widest uppercase rounded-xl hover:bg-champagne transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <><Loader2 size={16} className="animate-spin" />Đang đăng nhập...</> : 'Đăng nhập'}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="2fa-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerify2Fa}
                                className="space-y-5"
                            >
                                <div className="text-center py-2">
                                    <div className="w-16 h-16 bg-champagne/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck size={32} className="text-champagne" />
                                    </div>
                                    <p className="text-sm text-charcoal-light">Mã OTP 6 số đã được gửi đến email của bạn. Mã có hiệu lực trong 5 phút.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-sans font-semibold tracking-widest uppercase text-charcoal mb-2">Mã OTP</label>
                                    <input
                                        type="text"
                                        id="otp-code"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setServerError(''); }}
                                        placeholder="000000"
                                        autoFocus
                                        className="w-full py-4 text-center text-3xl font-mono tracking-[0.5em] bg-white/60 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-champagne/40 focus:border-champagne text-charcoal"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    id="otp-submit"
                                    disabled={isLoading || otpCode.length !== 6}
                                    className="w-full py-3.5 bg-charcoal text-ivory font-sans text-sm font-medium tracking-widest uppercase rounded-xl hover:bg-champagne transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <><Loader2 size={16} className="animate-spin" />Đang xác thực...</> : 'Xác nhận'}
                                </button>

                                <button type="button" onClick={() => { setStep('login'); setServerError(''); setOtpCode(''); }} className="w-full text-sm text-charcoal-light hover:text-champagne transition-colors">
                                    ← Quay lại đăng nhập
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {step === 'login' && (
                        <>
                            <div className="my-6 flex items-center gap-4">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-charcoal-light font-sans">hoặc</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>
                            <p className="text-center text-sm font-sans text-charcoal-light">
                                Chưa có tài khoản?{' '}
                                <Link to="/register" className="text-champagne font-semibold hover:underline underline-offset-2">Đăng ký ngay</Link>
                            </p>
                        </>
                    )}
                </div>

                <p className="text-center mt-6 text-xs text-charcoal-light font-sans">
                    <Link to="/" className="hover:text-champagne transition-colors">← Quay về trang chủ</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
