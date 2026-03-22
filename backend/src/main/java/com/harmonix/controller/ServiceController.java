package com.harmonix.controller;

import com.harmonix.constant.AppConstants;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.harmonix.dto.request.ServiceCreateRequest;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.dto.response.ServiceResponse;
import com.harmonix.entity.User;
import com.harmonix.repository.UserRepository;
import com.harmonix.service.CloudinaryService;
import com.harmonix.service.ServiceService;
import com.harmonix.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(AppConstants.SERVICES_PATH)
@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class ServiceController {

    private final ServiceService serviceService;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceResponse>> createService(
            HttpServletRequest request,
            @Valid @RequestBody ServiceCreateRequest createRequest
    ) {
        User user = AuthUtil.requireUser(request, userRepository);
        return createServiceResponse(user, createRequest);
    }

        @PostMapping(consumes = {"multipart/form-data"})
        public ResponseEntity<ApiResponse<ServiceResponse>> createServiceWithMedia(
            HttpServletRequest request,
                @RequestParam("title") String title,
                @RequestParam("description") String description,
                @RequestParam("price") double price,
                @RequestParam("deliveryTime") int deliveryTime,
                @RequestParam(value = "category", required = false) String category,
                @RequestParam(value = "tags", required = false) String tagsRaw,
                @RequestParam(value = "image", required = false) MultipartFile image,
                @RequestParam(value = "audio", required = false) MultipartFile audio
        ) {
        User user = AuthUtil.requireUser(request, userRepository);

        String imageUrl = safeUploadMedia(image, "image");
        String audioUrl = safeUploadMedia(audio, "audio");

        ServiceCreateRequest createRequest = new ServiceCreateRequest(
            title,
            description,
            price,
            deliveryTime,
            category,
            parseTags(tagsRaw),
            imageUrl,
            audioUrl
        );

        return createServiceResponse(user, createRequest);
    }

    private String safeUploadMedia(MultipartFile file, String mediaType) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            return cloudinaryService.uploadMedia(file);
        } catch (Exception ex) {
            log.warn("Failed to upload optional service {} '{}' ({} bytes): {}",
                    mediaType,
                    file.getOriginalFilename(),
                    file.getSize(),
                    ex.getMessage());
            return null;
        }
    }

    private List<String> parseTags(String tagsRaw) {
        if (tagsRaw == null || tagsRaw.isBlank()) {
            return null;
        }

        String trimmed = tagsRaw.trim();
        if (trimmed.startsWith("[")) {
            try {
                return objectMapper.readValue(trimmed, new TypeReference<List<String>>() {});
            } catch (Exception ex) {
                log.warn("Failed to parse tags JSON '{}': {}", tagsRaw, ex.getMessage());
            }
        }

        String[] parts = trimmed.split(",");
        List<String> tags = new ArrayList<>();
        for (String part : parts) {
            String value = part.trim();
            if (!value.isEmpty()) {
                tags.add(value);
            }
        }

        return tags.isEmpty() ? null : tags;
    }

    private ResponseEntity<ApiResponse<ServiceResponse>> createServiceResponse(User user, ServiceCreateRequest createRequest) {
        ServiceResponse response = serviceService.createService(
            user.getId(), user.getName(), createRequest
        );

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Service created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAllServices() {
        List<ServiceResponse> services = serviceService.getAllServices();
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getByCategory(
            @PathVariable String category
    ) {
        List<ServiceResponse> services = serviceService.getByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getBySeller(
            @PathVariable String sellerId
    ) {
        List<ServiceResponse> services = serviceService.getBySeller(sellerId);
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(
            HttpServletRequest request,
            @PathVariable String id
    ) {
        User user = AuthUtil.requireUser(request, userRepository);
        serviceService.deleteService(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Service deleted successfully", null));
    }
}
