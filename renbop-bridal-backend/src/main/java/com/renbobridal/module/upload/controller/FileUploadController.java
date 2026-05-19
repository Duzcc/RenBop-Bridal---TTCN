package com.renbobridal.module.upload.controller;

import com.renbobridal.common.response.ApiResponse;
import com.renbobridal.module.upload.service.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Tag(name = "Upload", description = "Endpoints for uploading files")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Upload an image to Cloudinary")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = fileUploadService.uploadImage(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("url", url);
        
        return ResponseEntity.ok(ApiResponse.ok("Tải ảnh lên thành công", response));
    }
}
