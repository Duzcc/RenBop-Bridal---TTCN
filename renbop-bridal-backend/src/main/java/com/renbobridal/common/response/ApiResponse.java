package com.renbobridal.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

/**
 * Chuẩn response cho tất cả API.
 *
 * Thành công: { success:true, message, data, timestamp }
 * Lỗi:       { success:false, message, code, timestamp }
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;
    private final String code;

    @Builder.Default
    private final Instant timestamp = Instant.now();

    // ── Factory helpers ──────────────────────────────────────

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("OK")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static ApiResponse<Void> ok(String message) {
        return ApiResponse.<Void>builder()
                .success(true)
                .message(message)
                .build();
    }

    public static ApiResponse<Void> error(String message, String code) {
        return ApiResponse.<Void>builder()
                .success(false)
                .message(message)
                .code(code)
                .build();
    }
}
