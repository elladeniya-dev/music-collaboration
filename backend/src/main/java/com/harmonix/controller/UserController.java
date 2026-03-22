package com.harmonix.controller;

import com.harmonix.constant.AppConstants;
import com.harmonix.dto.request.AvailabilityRequest;
import com.harmonix.dto.request.PortfolioRequest;
import com.harmonix.dto.request.ProfileUpdateRequest;
import com.harmonix.dto.request.UserTypeUpdateRequest;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.dto.response.UserResponse;
import com.harmonix.entity.User;
import com.harmonix.exception.ResourceNotFoundException;
import com.harmonix.mapper.UserMapper;
import com.harmonix.repository.UserRepository;
import com.harmonix.service.UserService;
import com.harmonix.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(AppConstants.USERS_PATH)
@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserService userService;

    // --- Original Endpoints ---

    @GetMapping("/{email}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        UserResponse userResponse = userMapper.toResponse(user);
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }

    @PutMapping("/type")
    public ResponseEntity<ApiResponse<String>> updateUserType(
            HttpServletRequest request,
            @Valid @RequestBody UserTypeUpdateRequest updateRequest) {

        User user = AuthUtil.requireUser(request, userRepository);
        user.setUserType(updateRequest.getUserType());
        userRepository.save(user);
        
        return ResponseEntity.ok(
                ApiResponse.success("User type updated to: " + updateRequest.getUserType(), null)
        );
    }

    @GetMapping("/bulk")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByIds(
            @RequestParam("ids") List<String> ids) {
        
        List<User> users = userRepository.findAllById(ids);
        List<UserResponse> userResponses = users.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(userResponses));
    }

    @GetMapping("/by-email/{email}")
    public ResponseEntity<ApiResponse<UserResponse>> fetchUserByEmail(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        UserResponse userResponse = userMapper.toResponse(user);
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }

    // --- New Profile System Endpoints ---

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(HttpServletRequest request) {
        User user = userService.getCurrentUserProfile(request);
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(user)));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(user)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            HttpServletRequest request,
            @Valid @RequestBody ProfileUpdateRequest updateRequest) {

        User currentUser = AuthUtil.requireUser(request, userRepository);
        User updatedUser = userService.updateProfile(currentUser.getId(), updateRequest);
        
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(updatedUser)));
    }

    @PostMapping("/portfolio")
    public ResponseEntity<ApiResponse<UserResponse>> addPortfolioItem(
            HttpServletRequest request,
            @Valid @RequestBody PortfolioRequest portfolioRequest) {

        User currentUser = AuthUtil.requireUser(request, userRepository);
        User updatedUser = userService.addPortfolioItem(currentUser.getId(), portfolioRequest);
        
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(updatedUser)));
    }

    @DeleteMapping("/portfolio/{portfolioId}")
    public ResponseEntity<ApiResponse<UserResponse>> deletePortfolioItem(
            HttpServletRequest request,
            @PathVariable String portfolioId) {

        User currentUser = AuthUtil.requireUser(request, userRepository);
        User updatedUser = userService.deletePortfolioItem(currentUser.getId(), portfolioId);
        
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(updatedUser)));
    }

    @PutMapping("/availability")
    public ResponseEntity<ApiResponse<UserResponse>> updateAvailability(
            HttpServletRequest request,
            @Valid @RequestBody AvailabilityRequest availabilityRequest) {

        User currentUser = AuthUtil.requireUser(request, userRepository);
        User updatedUser = userService.updateAvailability(currentUser.getId(), availabilityRequest);
        
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(updatedUser)));
    }
}
