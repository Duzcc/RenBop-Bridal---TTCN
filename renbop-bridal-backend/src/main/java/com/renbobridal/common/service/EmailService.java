package com.renbobridal.common.service;

import com.renbobridal.module.order.entity.Order;
import com.renbobridal.module.order.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.text.NumberFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // ── Formatter tiền VNĐ ───────────────────────────────────────────────
    private static final NumberFormat VND = NumberFormat.getInstance(new Locale("vi", "VN"));

    // ─────────────────────────────────────────────────────────────────────
    // 1. Đặt lại mật khẩu
    // ─────────────────────────────────────────────────────────────────────
    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String html = buildBaseTemplate(
            "Đặt lại mật khẩu",
            "<p style='font-size:15px;color:#555;'>Bạn đã yêu cầu đặt lại mật khẩu tài khoản Renbo Bridal.</p>" +
            "<p style='font-size:15px;color:#555;'>Nhấn vào nút bên dưới để tiếp tục. Link sẽ hết hạn sau <strong>15 phút</strong>.</p>" +
            "<div style='text-align:center;margin:32px 0;'>" +
            "  <a href='" + resetUrl + "' style='background:#c8a96e;color:#fff;padding:14px 32px;border-radius:4px;" +
            "     font-size:14px;font-weight:bold;text-decoration:none;letter-spacing:1px;'>ĐẶT LẠI MẬT KHẨU</a>" +
            "</div>" +
            "<p style='font-size:13px;color:#999;'>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>"
        );
        sendHtmlEmail(to, "[Renbo Bridal] Đặt lại mật khẩu", html);
    }

    // ─────────────────────────────────────────────────────────────────────
    // 2. Xác nhận đơn hàng
    // ─────────────────────────────────────────────────────────────────────
    public void sendOrderConfirmationEmail(String to, Order order, String transactionId) {
        String orderUrl = frontendUrl + "/profile";

        // Build danh sách sản phẩm
        StringBuilder itemsHtml = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            String productName = item.getProductItem() != null && item.getProductItem().getProduct() != null
                    ? item.getProductItem().getProduct().getName() : "Sản phẩm may đo";
            itemsHtml.append("<tr>")
                .append("<td style='padding:10px 8px;border-bottom:1px solid #f0e8d8;color:#333;'>")
                .append(productName).append("</td>")
                .append("<td style='padding:10px 8px;border-bottom:1px solid #f0e8d8;text-align:right;color:#c8a96e;font-weight:bold;'>")
                .append(VND.format(item.getPrice()))
                .append(" ₫</td>")
                .append("</tr>");
        }

        String body =
            "<p style='font-size:15px;color:#555;'>Xin chào <strong>" + order.getCustomer().getFullName() + "</strong>,</p>" +
            "<p style='font-size:15px;color:#555;'>Đơn hàng <strong>#" + order.getId() + "</strong> của bạn đã được xác nhận thanh toán thành công!</p>" +
            "<div style='background:#faf6f0;border-radius:8px;padding:20px;margin:20px 0;'>" +
            "  <table width='100%' cellpadding='0' cellspacing='0'>" +
            "    <tr style='background:#f0e8d8;'>" +
            "      <th style='padding:10px 8px;text-align:left;font-size:13px;color:#8a7050;'>Sản phẩm</th>" +
            "      <th style='padding:10px 8px;text-align:right;font-size:13px;color:#8a7050;'>Thành tiền</th>" +
            "    </tr>" +
            itemsHtml +
            "    <tr>" +
            "      <td style='padding:12px 8px;font-weight:bold;color:#333;'>Tổng cộng</td>" +
            "      <td style='padding:12px 8px;text-align:right;font-weight:bold;font-size:18px;color:#c8a96e;'>" +
            VND.format(order.getTotalAmount()) + " ₫</td>" +
            "    </tr>" +
            "  </table>" +
            "</div>" +
            (transactionId != null ? "<p style='font-size:14px;color:#555;'>🧾 <strong>Mã giao dịch:</strong> " + transactionId + "</p>" : "") +
            "<div style='text-align:center;margin:32px 0;'>" +
            "  <a href='" + orderUrl + "' style='background:#c8a96e;color:#fff;padding:14px 32px;border-radius:4px;" +
            "     font-size:14px;font-weight:bold;text-decoration:none;letter-spacing:1px;'>XEM ĐƠN HÀNG</a>" +
            "</div>";

        String html = buildBaseTemplate("Xác nhận đơn hàng #" + order.getId(), body);
        sendHtmlEmail(to, "[Renbo Bridal] Xác nhận đơn hàng #" + order.getId(), html);

        log.info("[EMAIL] Order confirmation sent to {} for orderId={}", to, order.getId());
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3. Cập nhật trạng thái đơn hàng
    // ─────────────────────────────────────────────────────────────────────
    public void sendOrderStatusUpdateEmail(String to, Order order) {
        String statusLabel = switch (order.getStatus()) {
            case IN_PROGRESS -> "⚙️ Đang xử lý";
            case COMPLETED   -> "✅ Hoàn thành";
            case CANCELLED   -> "❌ Đã hủy";
            default          -> order.getStatus().name();
        };

        String body =
            "<p style='font-size:15px;color:#555;'>Xin chào <strong>" + order.getCustomer().getFullName() + "</strong>,</p>" +
            "<p style='font-size:15px;color:#555;'>Trạng thái đơn hàng <strong>#" + order.getId() + "</strong> của bạn vừa được cập nhật:</p>" +
            "<div style='text-align:center;margin:28px 0;'>" +
            "  <span style='display:inline-block;background:#faf6f0;border:2px solid #c8a96e;color:#c8a96e;" +
            "               padding:16px 32px;border-radius:8px;font-size:22px;font-weight:bold;letter-spacing:1px;'>" +
            statusLabel + "</span>" +
            "</div>" +
            "<p style='font-size:14px;color:#555;text-align:center;'>Đơn hàng trị giá <strong>" +
            VND.format(order.getTotalAmount()) + " ₫</strong></p>" +
            "<div style='text-align:center;margin:28px 0;'>" +
            "  <a href='" + frontendUrl + "/profile' style='background:#c8a96e;color:#fff;padding:14px 32px;" +
            "     border-radius:4px;font-size:14px;font-weight:bold;text-decoration:none;'>XEM CHI TIẾT</a>" +
            "</div>";

        String html = buildBaseTemplate("Cập nhật đơn hàng #" + order.getId(), body);
        sendHtmlEmail(to, "[Renbo Bridal] Đơn hàng #" + order.getId() + " — " + statusLabel, html);

        log.info("[EMAIL] Status update sent to {} for orderId={} status={}", to, order.getId(), order.getStatus());
    }

    // ─────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────

    public void sendCustomEmail(String to, String title, String subject, String bodyContent) {
        String html = buildBaseTemplate(title, bodyContent);
        sendHtmlEmail(to, subject, html);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "Renbo Bridal");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = isHtml
            javaMailSender.send(message);
            log.info("[EMAIL] Sent '{}' to {}", subject, to);
        } catch (Exception e) {
            log.error("[EMAIL] Failed to send '{}' to {}: {}", subject, to, e.getMessage());
        }
    }

    /**
     * Khung email chung với thương hiệu Renbo Bridal — Header vàng + Footer
     */
    private String buildBaseTemplate(String title, String bodyContent) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='margin:0;padding:0;background:#f9f5f0;font-family:Georgia,serif;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f9f5f0;padding:40px 0;'>" +
            "  <tr><td align='center'>" +
            "    <table width='600' cellpadding='0' cellspacing='0' style='background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);'>" +
            // Header
            "      <tr><td style='background:linear-gradient(135deg,#2c2c2c 0%,#1a1a1a 100%);padding:36px 40px;text-align:center;'>" +
            "        <h1 style='margin:0;color:#c8a96e;font-size:28px;letter-spacing:4px;font-weight:300;'>RENBO BRIDAL</h1>" +
            "        <p style='margin:8px 0 0;color:#999;font-size:12px;letter-spacing:2px;text-transform:uppercase;'>Elegance in Every Detail</p>" +
            "      </td></tr>" +
            // Title bar
            "      <tr><td style='background:#faf6f0;padding:20px 40px;border-bottom:2px solid #f0e8d8;'>" +
            "        <h2 style='margin:0;color:#2c2c2c;font-size:20px;'>" + title + "</h2>" +
            "      </td></tr>" +
            // Body
            "      <tr><td style='padding:32px 40px;'>" + bodyContent + "</td></tr>" +
            // Footer
            "      <tr><td style='background:#2c2c2c;padding:24px 40px;text-align:center;'>" +
            "        <p style='margin:0;color:#999;font-size:12px;'>© 2025 Renbo Bridal. All rights reserved.</p>" +
            "        <p style='margin:6px 0 0;color:#666;font-size:11px;'>Email này được gửi tự động, vui lòng không reply.</p>" +
            "      </td></tr>" +
            "    </table>" +
            "  </td></tr>" +
            "</table>" +
            "</body></html>";
    }
}
