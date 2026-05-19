package com.renbobridal.module.upload.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }
        
        // Kiểm tra loại file
        if (!isImage(file)) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }

        try {
            // Tải lên cloudinary với tên duy nhất
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", "renbobridal/" + UUID.randomUUID().toString(),
                    "resource_type", "image"
            ));

            return (String) uploadResult.get("secure_url");
            
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }

    private boolean isImage(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }
}
