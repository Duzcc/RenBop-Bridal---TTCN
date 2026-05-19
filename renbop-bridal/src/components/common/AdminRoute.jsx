import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Bọc các route của Admin.
 * Nếu chưa đăng nhập -> redirect /login
 * Nếu đăng nhập nhưng không phải ROLE_ADMIN -> redirect /
 */
const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
                Đang xác minh quyền quản trị...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    if (user?.role !== 'ROLE_ADMIN' && user?.role !== 'ADMIN') {
        // Có thể thay bằng trang 403 Forbidden nếu muốn, ở đây tạm redirect về trang Khách
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
