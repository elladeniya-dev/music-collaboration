package com.harmonix.controller;

import com.harmonix.constant.AppConstants;
import com.harmonix.dto.request.ReviewCreateRequest;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.dto.response.ReviewResponse;
import com.harmonix.entity.User;
import com.harmonix.repository.UserRepository;
import com.harmonix.service.ReviewService;
import com.harmonix.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AppConstants.REVIEWS_PATH)
@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            HttpServletRequest request,
            @Valid @RequestBody ReviewCreateRequest createRequest) {

        User currentUser = AuthUtil.requireUser(request, userRepository);

        ReviewResponse response = reviewService.addReview(
                currentUser.getId(),
                currentUser.getName(),
                createRequest
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsBySeller(
            @PathVariable String sellerId) {

        List<ReviewResponse> responses = reviewService.getReviewsBySeller(sellerId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
