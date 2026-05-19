// Mọi logic tạo và xác minh Token (JWT) và mã hóa Mật khẩu nay được thực hiện trên Backend Server.

// ─── Password strength ────────────────────────────────────────────────────────

/**
 * Đánh giá độ mạnh mật khẩu
 * @returns {{ score: 0|1|2|3|4, label: string, color: string }}
 */
export const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
        { score: 0, label: '', color: '' },
        { score: 1, label: 'Rất yếu', color: '#ef4444' },
        { score: 2, label: 'Yếu', color: '#f97316' },
        { score: 3, label: 'Trung bình', color: '#eab308' },
        { score: 4, label: 'Mạnh', color: '#22c55e' },
        { score: 5, label: 'Rất mạnh', color: '#16a34a' },
    ];

    return levels[Math.min(score, 5)];
};

// ─── Validation ───────────────────────────────────────────────────────────────

export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Ít nhất 8 ký tự');
    if (!/[A-Z]/.test(password)) errors.push('Có ít nhất 1 chữ hoa');
    if (!/[0-9]/.test(password)) errors.push('Có ít nhất 1 chữ số');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Có ít nhất 1 ký tự đặc biệt (!@#$%...)');
    return errors;
};

// ─── Storage keys ─────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'rb_access_token',
    REFRESH_TOKEN: 'rb_refresh_token',
    CURRENT_USER: 'rb_current_user',
};
