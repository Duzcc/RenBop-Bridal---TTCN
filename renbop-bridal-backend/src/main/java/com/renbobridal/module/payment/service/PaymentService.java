package com.renbobridal.module.payment.service;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.common.service.EmailService;
import com.renbobridal.module.order.entity.Order;
import com.renbobridal.module.order.repository.OrderRepository;
import com.renbobridal.module.payment.dto.PaymentDto;
import com.renbobridal.module.payment.dto.PaymentRequest;
import com.renbobridal.module.payment.entity.Payment;
import com.renbobridal.module.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository   orderRepository;
    private final EmailService      emailService;

    /**
     * Khởi tạo payment cho một đơn hàng.
     * Trả về thông tin cổng thanh toán (QR, deeplink, ...) để frontend hiển thị.
     */
    @Transactional
    public PaymentDto initiatePayment(Long orderId, Long userId, PaymentRequest request) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Chỉ chủ đơn mới được thanh toán
        if (!order.getCustomer().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Đơn phải đang PENDING hoặc IN_PROGRESS mới được khởi tạo thanh toán
        if (order.getStatus() == Order.Status.COMPLETED || order.getStatus() == Order.Status.CANCELLED) {
            throw new AppException(ErrorCode.ORDER_NOT_PAYABLE);
        }

        // Không cho thanh toán lại nếu đã COMPLETED
        if (paymentRepository.existsByOrderIdAndStatus(orderId, Payment.Status.COMPLETED)) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_COMPLETED);
        }

        Payment.PaymentMethod method = parseMethod(request.getMethod());

        // Tạo bản ghi payment với trạng thái PENDING
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(method)
                .status(Payment.Status.PENDING)
                .amount(order.getTotalAmount())
                .build();
        payment = paymentRepository.save(payment);

        log.info("[PAYMENT] Initiated payment id={} orderId={} method={} amount={}",
                payment.getId(), orderId, method, order.getTotalAmount());

        // Tạo thông tin gateway (giả lập)
        PaymentDto.GatewayInfo gatewayInfo = buildGatewayInfo(method, order, payment);

        return mapToDto(payment, gatewayInfo);
    }

    /**
     * Xác nhận kết quả thanh toán (giả lập callback từ gateway).
     * Production: đây sẽ là webhook endpoint được gateway gọi vào.
     */
    @Transactional
    public PaymentDto confirmPayment(Long paymentId, Long userId, boolean success) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        Order order = payment.getOrder();

        if (!order.getCustomer().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (payment.getStatus() == Payment.Status.COMPLETED) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_COMPLETED);
        }

        if (success) {
            // Thanh toán thành công
            String txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
            payment.setStatus(Payment.Status.COMPLETED);
            payment.setTransactionId(txnId);

            // Chuyển trạng thái đơn → IN_PROGRESS
            order.setStatus(Order.Status.IN_PROGRESS);
            orderRepository.save(order);

            log.info("[PAYMENT] SUCCESS paymentId={} orderId={} txnId={}", paymentId, order.getId(), txnId);

            // Gửi email xác nhận đơn hàng
            try {
                emailService.sendOrderConfirmationEmail(order.getCustomer().getEmail(), order, txnId);
            } catch (Exception e) {
                log.warn("[EMAIL] Failed to send order-confirmation email for orderId={}: {}", order.getId(), e.getMessage());
            }

        } else {
            // Thanh toán thất bại
            payment.setStatus(Payment.Status.FAILED);
            log.warn("[PAYMENT] FAILED paymentId={} orderId={}", paymentId, order.getId());
        }

        payment = paymentRepository.save(payment);
        return mapToDto(payment, null);
    }

    /**
     * Lấy lịch sử thanh toán của một đơn hàng.
     */
    @Transactional(readOnly = true)
    public List<PaymentDto> getPaymentsByOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getCustomer().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        return paymentRepository.findByOrderId(orderId).stream()
                .map(p -> mapToDto(p, null))
                .collect(Collectors.toList());
    }

    /**
     * [Admin] Lấy tất cả lịch sử thanh toán.
     */
    @Transactional(readOnly = true)
    public List<PaymentDto> getAllPaymentsAdmin() {
        return paymentRepository.findAll().stream()
                .map(p -> mapToDto(p, null))
                .collect(Collectors.toList());
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private Payment.PaymentMethod parseMethod(String method) {
        try {
            return Payment.PaymentMethod.valueOf(method.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_METHOD);
        }
    }

    /**
     * Sinh thông tin gateway giả lập theo từng phương thức thanh toán.
     */
    private PaymentDto.GatewayInfo buildGatewayInfo(Payment.PaymentMethod method, Order order, Payment payment) {
        return switch (method) {
            case BANK_TRANSFER -> PaymentDto.GatewayInfo.builder()
                    .qrCodeUrl(buildVietQrUrl(order))
                    .instruction("Quét mã QR bằng ứng dụng ngân hàng để chuyển khoản. Nội dung: RENBO " + order.getId())
                    .build();
            case MOMO -> PaymentDto.GatewayInfo.builder()
                    .qrCodeUrl("https://img.vietqr.io/image/970422-0965177911-compact2.png?amount=" + order.getTotalAmount().longValue() + "&addInfo=RENBO%20" + order.getId() + "&accountName=RENBO%20BRIDAL")
                    .instruction("Quét mã QR bằng ứng dụng MoMo hoặc ứng dụng ngân hàng. Nội dung: RENBO " + order.getId())
                    .build();
            case CREDIT_CARD -> PaymentDto.GatewayInfo.builder()
                    .approvalUrl("https://www.sandbox.paypal.com/checkoutnow?token=RENBO_DEMO_" + payment.getId())
                    .instruction("Nhập thông tin thẻ tín dụng để hoàn tất thanh toán.")
                    .build();
            case CASH -> PaymentDto.GatewayInfo.builder()
                    .instruction("Thanh toán tiền mặt tại cửa hàng. Số tiền: " +
                                 order.getTotalAmount().toPlainString() + " VNĐ.")
                    .build();
        };
    }

    /**
     * Tạo URL VietQR (https://vietqr.io) — định dạng quick link
     * Bank: MB Bank | STK: 0123456789 | Tên: RENBO BRIDAL (demo)
     */
    private String buildVietQrUrl(Order order) {
        String bankId    = "MB";          // Mã ngân hàng VietQR
        String accountNo = "0123456789";  // Số tài khoản demo
        String amount    = order.getTotalAmount().toPlainString();
        String addInfo   = "RENBO " + order.getId();
        String accountName = "RENBO BRIDAL";
        return String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                bankId, accountNo, amount, addInfo.replace(" ", "%20"), accountName.replace(" ", "%20")
        );
    }

    private PaymentDto mapToDto(Payment payment, PaymentDto.GatewayInfo gatewayInfo) {
        String customerName = null;
        if (payment.getOrder() != null && payment.getOrder().getCustomer() != null) {
            customerName = payment.getOrder().getCustomer().getFullName();
        }

        return PaymentDto.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .customerName(customerName)
                .method(payment.getPaymentMethod().name())
                .status(payment.getStatus().name())
                .amount(payment.getAmount())
                .transactionId(payment.getTransactionId())
                .createdAt(payment.getCreatedAt())
                .gatewayInfo(gatewayInfo)
                .build();
    }
}
