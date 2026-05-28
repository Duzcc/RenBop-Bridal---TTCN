import { STORAGE_KEYS } from './authUtils';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Refresh access token tự động khi nhận 401.
 * Trả về access token mới hoặc null nếu refresh cũng hết hạn.
 */
const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) return null;

    try {
        const response = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`
            },
        });

        if (!response.ok) {
            // Refresh cũng hết hạn → logout
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            window.location.href = '/login';
            return null;
        }

        const data = await response.json();
        const newAccessToken = data?.data?.accessToken;
        if (newAccessToken) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        }
        return newAccessToken;
    } catch {
        return null;
    }
};

/**
 * Custom fetch wrapper:
 * - Auto gắn Authorization Bearer token
 * - Auto retry 1 lần khi nhận 401 (refresh token flow)
 * - Chuẩn hoá error response
 */
export const apiClient = async (endpoint, options = {}, _retry = false) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // ── Auto-refresh khi 401 ───────────────────────────────────────
        const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/2fa/verify');
        if (response.status === 401 && !_retry && !isAuthEndpoint) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                // Retry lần 2 với token mới
                return apiClient(endpoint, options, true);
            }
            // Refresh thất bại → đã redirect sang /login
            throw { status: 401, message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' };
        }
        // ─────────────────────────────────────────────────────────────

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw {
                status: response.status,
                message: data?.message || data?.error || 'Đã có lỗi xảy ra từ máy chủ',
                data,
            };
        }

        return data;
    } catch (error) {
        if (!error.status) {
            // Likely offline or server down
            const method = options.method || 'GET';
            if (method !== 'GET') {
                try {
                    const { enqueueRequest } = await import('./offlineSync.js');
                    await enqueueRequest(endpoint, options);
                    return { success: true, isOfflineQueued: true, message: 'Đã lưu cục bộ. Sẽ đồng bộ khi có mạng.' };
                } catch (e) {
                    console.error('Failed to queue offline action', e);
                }
            }

            throw {
                status: 503,
                message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!',
            };
        }
        throw error;
    }
};

// Listen for online event to process queue
window.addEventListener('online', async () => {
    try {
        const { processQueue } = await import('./offlineSync.js');
        await processQueue(apiClient);
    } catch (error) {
        console.error('Error processing offline queue on reconnect:', error);
    }
});
