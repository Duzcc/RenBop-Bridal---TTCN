import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, ChevronDown, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const UserMenu = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logout();
        setOpen(false);
        navigate('/');
    };

    // Chưa đăng nhập → icon user → link /login
    if (!isAuthenticated) {
        return (
            <Link
                to="/login"
                aria-label="Đăng nhập"
                className="hover:text-champagne transition-colors"
            >
                <User size={20} strokeWidth={1.5} />
            </Link>
        );
    }

    // Đã đăng nhập → avatar + dropdown
    const initials = user.name
        ? user.name.split(' ').map((n) => n[0]).slice(-2).join('').toUpperCase()
        : '?';

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1.5 hover:text-champagne transition-colors group"
                aria-label="Tài khoản"
            >
                {/* Avatar circle */}
                <span className="w-8 h-8 rounded-full bg-champagne/20 border border-champagne/40 flex items-center justify-center font-sans text-xs font-semibold text-champagne group-hover:bg-champagne group-hover:text-ivory transition-all">
                    {initials}
                </span>
                <ChevronDown
                    size={14}
                    strokeWidth={2}
                    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-3 w-56 glass rounded-xl shadow-xl overflow-hidden z-[80]"
                    >
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-white/20">
                            <p className="text-sm font-serif text-charcoal truncate">{user.name}</p>
                            <p className="text-xs text-charcoal-light truncate mt-0.5">{user.email}</p>
                        </div>

                        {/* Menu items */}
                        <div className="py-1.5">
                            <Link
                                to="/profile"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-sans text-charcoal hover:bg-champagne/10 hover:text-champagne transition-colors"
                            >
                                <LayoutDashboard size={15} strokeWidth={1.5} />
                                Hồ sơ của tôi
                            </Link>
                            
                            {user.role === 'ADMIN' && (
                                <Link
                                    to="/admin"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-sans text-charcoal hover:bg-champagne/10 hover:text-champagne transition-colors border-t border-white/20"
                                >
                                    <ShieldAlert size={15} strokeWidth={1.5} />
                                    Vào trang Quản Trị
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-sans text-charcoal hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                <LogOut size={15} strokeWidth={1.5} />
                                Đăng xuất
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserMenu;
