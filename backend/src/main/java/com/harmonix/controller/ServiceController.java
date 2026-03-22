package com.harmonix.controller;

import com.harmonix.constant.AppConstants;
import com.harmonix.dto.request.ServiceCreateRequest;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.dto.response.ServiceResponse;
import com.harmonix.entity.User;
import com.harmonix.repository.UserRepository;
import com.harmonix.service.ServiceService;
import com.harmonix.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AppConstants.SERVICES_PATH)
@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceResponse>> createService(
            HttpServletRequest request,
            @Valid @RequestBody ServiceCreateRequest createRequest
    ) {
        User user = AuthUtil.requireUser(request, userRepository);

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
