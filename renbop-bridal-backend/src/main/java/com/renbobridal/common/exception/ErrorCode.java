package com.renbobridal.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // ── Auth ─────────────────────────────────────────────────
    EMAIL_ALREADY_EXISTS("Email này đã được đăng ký", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS("Email hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN("Token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED("Bạn chưa đăng nhập", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    ACCOUNT_LOCKED("Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần. Vui lòng thử lại sau 15 phút", HttpStatus.FORBIDDEN),

    // ── Resource ─────────────────────────────────────────────
    USER_NOT_FOUND("Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_FOUND("Không tìm thấy sản phẩm / sản phẩm kho", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND("Không tìm thấy danh mục", HttpStatus.NOT_FOUND),
    ORDER_NOT_FOUND("Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),
    PAYMENT_NOT_FOUND("Không tìm thấy thông tin thanh toán", HttpStatus.NOT_FOUND),

    // ── Validation ──────────────────────────────────────────
    BAD_REQUEST("Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    SLUG_ALREADY_EXISTS("Slug này đã tồn tại", HttpStatus.CONFLICT),
    PRODUCT_SLUG_EXISTS("Slug sản phẩm đã tồn tại", HttpStatus.CONFLICT),
    CATEGORY_SLUG_EXISTS("Slug danh mục đã tồn tại", HttpStatus.CONFLICT),
    INVALID_ORDER_STATUS("Trạng thái đơn hàng không hợp lệ", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_BE_CANCELLED("Đơn hàng không thể hủy ở trạng thái hiện tại", HttpStatus.BAD_REQUEST),
    OUT_OF_STOCK("Sản phẩm không còn khả dụng", HttpStatus.BAD_REQUEST),
    CANNOT_DELETE_CATEGORY_WITH_PRODUCTS("Danh mục còn sản phẩm, không thể xóa", HttpStatus.CONFLICT),
    INVALID_FILE("File không hợp lệ hoặc kích thước quá lớn", HttpStatus.BAD_REQUEST),
    UPLOAD_FAILED("Lỗi khi tải ảnh lên máy chủ", HttpStatus.INTERNAL_SERVER_ERROR),

    // ── Payment ─────────────────────────────────────────────
    PAYMENT_ALREADY_COMPLETED("Đơn hàng này đã được thanh toán", HttpStatus.CONFLICT),
    PAYMENT_FAILED("Thanh toán thất bại, vui lòng thử lại", HttpStatus.BAD_REQUEST),
    INVALID_PAYMENT_METHOD("Phương thức thanh toán không hợp lệ", HttpStatus.BAD_REQUEST),
    ORDER_NOT_PAYABLE("Đơn hàng không ở trạng thái có thể thanh toán", HttpStatus.BAD_REQUEST),

    // ── Workflow (Tailoring, Fitting, Returns) ──────────────
    FITTING_SESSION_NOT_FOUND("Không tìm thấy lịch thử đồ", HttpStatus.NOT_FOUND),
    INVALID_FITTING_DATE("Ngày thử đồ không hợp lệ (phải trong tương lai)", HttpStatus.BAD_REQUEST),
    TAILORING_ORDER_NOT_FOUND("Không tìm thấy phiếu may đo", HttpStatus.NOT_FOUND),
    INVALID_TAILORING_STATUS_TRANSITION("Chuyển trạng thái may đo không hợp lệ", HttpStatus.BAD_REQUEST),
    RETURN_NOT_FOUND("Không tìm thấy phiếu trả đồ", HttpStatus.NOT_FOUND),
    RETURN_ALREADY_PROCESSED("Đơn hàng này đã được ghi nhận trả đồ", HttpStatus.CONFLICT),
    INVALID_RETURN_DATE("Ngày trả đồ không được trước ngày nhận đồ", HttpStatus.BAD_REQUEST),

    // ── System ──────────────────────────────────────────────
    INTERNAL_ERROR("Lỗi hệ thống, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String message;
    private final HttpStatus httpStatus;
}
