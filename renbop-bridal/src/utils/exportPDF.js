import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Xuất báo cáo Dashboard ra file PDF cao cấp với header logo và footer ký tên.
 * @param {string} elementId - ID của phần tử HTML cần xuất.
 * @param {object} options - Tùy chọn thêm (title, fromDate, toDate).
 */
export const exportDashboardPDF = async (elementId, options = {}) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Element not found:', elementId);
        return;
    }

    const { title = 'Báo cáo Tổng quan', fromDate = null, toDate = null } = options;
    const dateRange = fromDate && toDate
        ? `Từ ${new Date(fromDate).toLocaleDateString('vi-VN')} đến ${new Date(toDate).toLocaleDateString('vi-VN')}`
        : `Ngày in: ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

    // 1. Chụp màn hình Dashboard
    const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#f8f8fc',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    const PAGE_WIDTH = pdf.internal.pageSize.getWidth();   // 297
    const PAGE_HEIGHT = pdf.internal.pageSize.getHeight(); // 210

    const HEADER_H = 28;
    const FOOTER_H = 16;
    const CONTENT_H = PAGE_HEIGHT - HEADER_H - FOOTER_H;

    // ─── 2. HEADER ──────────────────────────────────────────────────────────
    // Background header
    pdf.setFillColor(13, 14, 23); // #0d0e17
    pdf.rect(0, 0, PAGE_WIDTH, HEADER_H, 'F');

    // Gold accent stripe
    pdf.setFillColor(201, 169, 110); // #c9a96e
    pdf.rect(0, HEADER_H - 1.5, PAGE_WIDTH, 1.5, 'F');

    // Logo / Brand name
    pdf.setTextColor(201, 169, 110);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text('RENBO BRIDAL', 12, 10);

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('Hệ thống Quản lý Bridal Cao cấp', 12, 15.5);

    // Report title (right)
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, PAGE_WIDTH - titleWidth - 12, 10);

    // Date range (right below title)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(200, 200, 200);
    const dateWidth = pdf.getTextWidth(dateRange);
    pdf.text(dateRange, PAGE_WIDTH - dateWidth - 12, 16);

    // ─── 3. CONTENT (Dashboard screenshot) ─────────────────────────────────
    const imgWidth = PAGE_WIDTH;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Fit image into content area
    const renderH = Math.min(imgHeight, CONTENT_H);
    pdf.addImage(imgData, 'PNG', 0, HEADER_H, imgWidth, renderH, '', 'FAST');

    // ─── 4. FOOTER ─────────────────────────────────────────────────────────
    const footerY = PAGE_HEIGHT - FOOTER_H;
    pdf.setFillColor(248, 248, 252); // #f8f8fc
    pdf.rect(0, footerY, PAGE_WIDTH, FOOTER_H, 'F');
    pdf.setDrawColor(232, 232, 240);
    pdf.line(0, footerY, PAGE_WIDTH, footerY);

    // Left: generated note
    pdf.setTextColor(100, 100, 130);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7.5);
    pdf.text('Tài liệu được tạo tự động bởi hệ thống Renbo Bridal Admin Console', 12, footerY + 6);

    // Right: signature line
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.text('Xác nhận bởi:', PAGE_WIDTH - 80, footerY + 5);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(13, 14, 23);
    pdf.text('Ban Quản lý — Renbo Bridal', PAGE_WIDTH - 80, footerY + 11);
    pdf.setDrawColor(201, 169, 110);
    pdf.line(PAGE_WIDTH - 80, footerY + 12.5, PAGE_WIDTH - 10, footerY + 12.5);

    // Page number center
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(150, 150, 170);
    const pageText = 'Trang 1 / 1';
    const pageTextW = pdf.getTextWidth(pageText);
    pdf.text(pageText, (PAGE_WIDTH - pageTextW) / 2, footerY + 8);

    // ─── 5. SAVE ────────────────────────────────────────────────────────────
    const fileName = `RenboBridal_BaoCao_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
};
