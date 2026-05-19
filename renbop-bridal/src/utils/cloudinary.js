/**
 * Tiện ích tải ảnh trực tiếp lên Cloudinary (Không thông qua Backend)
 * Yêu cầu: Bật "Unsigned Uploading" trong Upload Presets của Cloudinary.
 * Cấu hình trong: .env.local
 *   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
 */

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadImageToCloudinary = async (file) => {
    if (!file) return null;

    // Guard: kiểm tra biến môi trường
    if (!CLOUD_NAME || CLOUD_NAME === 'YOUR_CLOUD_NAME_HERE') {
        throw new Error(
            '❌ Chưa cấu hình Cloudinary!\n' +
            'Mở file .env.local và điền VITE_CLOUDINARY_CLOUD_NAME'
        );
    }
    if (!UPLOAD_PRESET || UPLOAD_PRESET === 'YOUR_UPLOAD_PRESET_HERE') {
        throw new Error(
            '❌ Chưa cấu hình Upload Preset!\n' +
            'Mở file .env.local và điền VITE_CLOUDINARY_UPLOAD_PRESET'
        );
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(url, { method: 'POST', body: formData });

        if (!response.ok) {
            let msg = `Cloudinary lỗi HTTP ${response.status}`;
            try {
                const err = await response.json();
                msg = err?.error?.message || msg;
            } catch (_) {}
            // 400 thường là preset không tồn tại hoặc chưa bật Unsigned
            if (response.status === 400) {
                msg += '\n→ Kiểm tra Upload Preset có tồn tại và bật "Unsigned" chưa?';
            }
            throw new Error(msg);
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error.message);
        throw error;
    }
};

/** Kiểm tra xem Cloudinary đã được cấu hình chưa (dùng để disable nút upload) */
export const isCloudinaryConfigured = () =>
    !!CLOUD_NAME &&
    CLOUD_NAME !== 'YOUR_CLOUD_NAME_HERE' &&
    !!UPLOAD_PRESET &&
    UPLOAD_PRESET !== 'YOUR_UPLOAD_PRESET_HERE';
