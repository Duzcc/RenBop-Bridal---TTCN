package com.renbobridal.module.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class Verify2FaRequest {
    @NotBlank(message = "Temp token không được để trống")
    private String tempToken;

    @NotBlank(message = "Mã OTP không được để trống")
    private String code;
}
