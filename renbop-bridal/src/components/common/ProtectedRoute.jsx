import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Bọc các route cần đăng nhập.
 * Nếu chưa đăng nhập → redirect /login?redirect=<current path>
 * Nếu đang kiểm tra trạng thái auth → hiện skeleton nhẹ
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-ivory flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-champagne border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                replace
            />
        );
    }

    return children;
};

export default ProtectedRoute;
