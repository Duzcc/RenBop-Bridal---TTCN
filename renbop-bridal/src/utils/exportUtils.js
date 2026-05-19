/**
 * Chuyển đổi mảng object JSON thành file CSV và tự động tải xuống.
 * 
 * @param {Array} data - Mảng dữ liệu cần xuất (Ví dụ: danh sách đơn hàng).
 * @param {Array} headers - Mảng chứa tiêu đề các cột [{ key: 'id', label: 'Mã Đơn' }, ...].
 * @param {String} filename - Tên file tải xuống.
 */
export const downloadCSV = (data, headers, filename = 'export.csv') => {
    if (!data || !data.length) {
        alert('Không có dữ liệu để xuất');
        return;
    }

    // Tạo BOM để Excel nhận diện chuẩn UTF-8 Tiếng Việt
    const BOM = '\uFEFF';

    // Tạo Header Row
    const headerRow = headers.map(h => `"${h.label}"`).join(',');

    // Tạo Data Rows
    const dataRows = data.map(item => {
        return headers.map(header => {
            let value = item[header.key];
            // Xử lý null, undefined
            if (value === null || value === undefined) value = '';
            // Escape dấu ngoặc kép và bọc trong ngoặc kép để tránh lỗi khi có dấu phẩy trong chuỗi
            value = String(value).replace(/"/g, '""');
            return `"${value}"`;
        }).join(',');
    });

    const csvContent = BOM + [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
