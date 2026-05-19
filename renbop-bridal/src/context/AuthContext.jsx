import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateEmail, validatePassword, STORAGE_KEYS } from '../utils/authUtils';
import { apiClient } from '../utils/apiClient';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const _clearSession = () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        setUser(null);
        setAccessToken(null);
    };

    // ── Restore session on mount ──
    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            if (!token) {
                setLoading(false);
                return;
            }
            
            // Gọi Backend để xác thực token và lấy thông tin user
            const response = await apiClient('/auth/me');
            
            if (response.success && response.data) {
                setUser(response.data);
                setAccessToken(token);
            } else {
                _clearSession();
            }
        } catch (error) {
            console.error('Session expired or error:', error);
            _clearSession();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    // ── Register ──
    const register = async ({ name, email, password, confirmPassword }) => {
        // Validate
        if (!name || name.trim().length < 2) {
            return { success: false, error: 'Họ tên phải có ít nhất 2 ký tự' };
        }
        if (!validateEmail(email)) {
            return { success: false, error: 'Email không hợp lệ' };
        }
        const pwErrors = validatePassword(password);
        if (pwErrors.length > 0) {
            return { success: false, error: pwErrors.join(', ') };
        }
        if (password !== confirmPassword) {
            return { success: false, error: 'Mật khẩu xác nhận không khớp' };
        }

        try {
            const requestData = {
                name: name.trim(),
                email: email.toLowerCase(),
                password: password
            };
            
            const response = await apiClient('/auth/register', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });
            
            // Backend trả về AuthResponse { accessToken, refreshToken, user }
            const authData = response.data;
            
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(authData.user));

            setUser(authData.user);
            setAccessToken(authData.accessToken);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Đăng ký thất bại' };
        }
    };

    // ── Login ── (supports 2FA flow)
    const login = async ({ email, password }) => {
        if (!validateEmail(email)) {
            return { success: false, error: 'Email không hợp lệ' };
        }
        if (!password) {
            return { success: false, error: 'Vui lòng nhập mật khẩu' };
        }

        try {
            const response = await apiClient('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email: email.toLowerCase(), password })
            });

            const authData = response.data;

            // 2FA flow: backend returns tempToken instead of accessToken
            if (authData.requires2Fa && authData.tempToken) {
                return { success: true, requires2Fa: true, tempToken: authData.tempToken };
            }

            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(authData.user));

            setUser(authData.user);
            setAccessToken(authData.accessToken);

            return { success: true, role: authData.user.role };
        } catch (error) {
            // Handle specific backend error codes
            const code = error.code || '';
            if (code === 'ACCOUNT_LOCKED') {
                return { success: false, error: 'Tài khoản bị khóa 15 phút do nhập sai quá nhiều lần!', code: 'ACCOUNT_LOCKED' };
            }
            if (code === 'TOO_MANY_REQUESTS' || error.status === 429) {
                return { success: false, error: 'Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ít phút.', code: 'TOO_MANY_REQUESTS' };
            }
            return { success: false, error: error.message || 'Sai thông tin đăng nhập' };
        }
    };

    // ── Verify 2FA OTP ──
    const verify2Fa = async ({ tempToken, code }) => {
        try {
            const response = await apiClient('/auth/2fa/verify', {
                method: 'POST',
                body: JSON.stringify({ tempToken, code })
            });

            const authData = response.data;

            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(authData.user));

            setUser(authData.user);
            setAccessToken(authData.accessToken);

            return { success: true, role: authData.user.role };
        } catch (error) {
            return { success: false, error: error.message || 'Mã OTP không hợp lệ hoặc đã hết hạn' };
        }
    };

    // ── Logout ──
    const logout = () => {
        _clearSession();
    };

    const isAuthenticated = !!user && !!accessToken;

    const set2FaEnabledState = (enabled) => {
        if (user) {
            const updated = { ...user, is2FaEnabled: enabled };
            setUser(updated);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
        }
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, isAuthenticated, loading, login, verify2Fa, register, logout, set2FaEnabledState }}>
            {children}
        </AuthContext.Provider>
    );
};
