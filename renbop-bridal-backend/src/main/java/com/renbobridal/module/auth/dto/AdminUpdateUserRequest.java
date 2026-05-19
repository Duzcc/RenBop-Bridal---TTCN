package com.renbobridal.module.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Request body cho admin cập nhật thông tin user */
@Data
public class AdminUpdateUserRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String name;

    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$|^$",
             message = "Số điện thoại không đúng định dạng Việt Nam")
    private String phone;
}
