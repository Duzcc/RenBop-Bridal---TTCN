import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// A utility to format currency
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

export const generateOrderReport = async (order) => {
    // 1. Create a temporary container for the HTML we want to convert to PDF
    const printContainer = document.createElement('div');
    printContainer.style.width = '800px'; // Fixed width for A4 ratio approximation
    printContainer.style.padding = '40px';
    printContainer.style.background = 'white';
    printContainer.style.color = '#000';
    printContainer.style.fontFamily = 'Arial, sans-serif';
    
    // We construct a very beautiful and premium looking invoice HTML
    printContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
            <div>
                <h1 style="font-size: 28px; font-weight: 900; margin: 0; letter-spacing: 2px; text-transform: uppercase;">RENBO BRIDAL</h1>
                <p style="color: #666; font-size: 14px; margin: 4px 0 0;">Luxury Bridal Boutique</p>
                <p style="color: #666; font-size: 12px; margin: 8px 0 0;">123 Nguyen Van Linh, Da Nang, VN</p>
                <p style="color: #666; font-size: 12px; margin: 4px 0 0;">Phone: 0901 234 567</p>
            </div>
            <div style="text-align: right;">
                <h2 style="font-size: 36px; font-weight: 900; color: #f0f0f0; margin: 0; letter-spacing: 4px; text-transform: uppercase;">INVOICE</h2>
                <p style="font-size: 16px; font-weight: 700; margin: 8px 0 0;">Mã Đơn: #${order.id}</p>
                <p style="font-size: 14px; font-weight: 700; margin: 4px 0 0;">Ngày: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
        </div>

        <div style="display: flex; gap: 40px; margin-bottom: 30px;">
            <div style="flex: 1;">
                <h3 style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px;">Khách Hàng</h3>
                <p style="font-size: 16px; font-weight: 700; margin: 0;">${order.customerName}</p>
                <p style="font-size: 14px; color: #444; margin: 4px 0 0;">${order.customerEmail}</p>
                <p style="font-size: 14px; color: #444; margin: 4px 0 0;">${order.customerPhone || 'N/A'}</p>
            </div>
            <div style="flex: 1;">
                <h3 style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px;">Thông Tin Đơn Hàng</h3>
                <p style="font-size: 14px; font-weight: 700; margin: 0;"><span style="color: #666; font-weight: normal; margin-right: 8px;">Loại đơn:</span> ${order.orderType}</p>
                <p style="font-size: 14px; font-weight: 700; margin: 4px 0 0;"><span style="color: #666; font-weight: normal; margin-right: 8px;">Trạng thái:</span> ${order.status}</p>
            </div>
        </div>

        <table style="width: 100%; text-align: left; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
                <tr style="border-bottom: 2px solid #eee;">
                    <th style="padding: 12px 0; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Sản phẩm</th>
                    <th style="padding: 12px 0; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-align: center;">SKU</th>
                    <th style="padding: 12px 0; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-align: right;">Đơn giá</th>
                </tr>
            </thead>
            <tbody>
                ${(order.items || []).map(item => `
                    <tr style="border-bottom: 1px solid #f4f4f4;">
                        <td style="padding: 16px 0;">
                            <p style="font-size: 14px; font-weight: 700; margin: 0;">${item.productName}</p>
                            ${item.rentalStartDate ? `<p style="font-size: 12px; color: #666; margin: 4px 0 0;">Thuê: ${item.rentalStartDate} → ${item.rentalEndDate}</p>` : ''}
                        </td>
                        <td style="padding: 16px 0; text-align: center; font-size: 14px; font-family: monospace; color: #666;">${item.sku}</td>
                        <td style="padding: 16px 0; text-align: right; font-size: 14px; font-weight: 700;">${formatCurrency(item.price)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; border-top: 2px solid #eee; padding-top: 24px;">
            <div style="width: 50%;">
                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
                    <span style="color: #666;">Tạm tính:</span>
                    <span style="font-weight: 700;">${formatCurrency(order.totalAmount)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 16px;">
                    <span style="color: #666;">Giảm giá:</span>
                    <span style="font-weight: 700;">${formatCurrency(0)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 16px;">
                    <span style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Tổng Thanh Toán:</span>
                    <span style="font-size: 24px; font-weight: 900;">${formatCurrency(order.totalAmount)}</span>
                </div>
            </div>
        </div>

        <div style="margin-top: 80px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
            <p style="margin: 0;">Cảm ơn quý khách đã tin tưởng và lựa chọn Renbo Bridal.</p>
            <p style="margin: 4px 0 0;">Mọi thắc mắc vui lòng liên hệ hotline: 0901 234 567.</p>
        </div>
        
        <div style="position: absolute; bottom: 80px; right: 80px; text-align: center;">
            <p style="font-size: 14px; color: #666; margin-bottom: 40px;">Đại diện Renbo Bridal</p>
            <p style="font-size: 24px; font-family: cursive; font-weight: bold; color: #000;">Renbo Bridal</p>
        </div>
    `;

    document.body.appendChild(printContainer);

    try {
        const canvas = await html2canvas(printContainer, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Renbo_Invoice_${order.id}.pdf`);
    } finally {
        document.body.removeChild(printContainer);
    }
};
