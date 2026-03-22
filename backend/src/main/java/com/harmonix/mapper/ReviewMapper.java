package com.harmonix.mapper;

import com.harmonix.dto.request.ReviewCreateRequest;
import com.harmonix.dto.response.ReviewResponse;
import com.harmonix.entity.Review;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class ReviewMapper {

    public Review toEntity(ReviewCreateRequest request, String reviewerId, String reviewerName, String sellerId) {
        if (request == null) return null;

        return Review.builder()
                .orderId(request.getOrderId())
                .rating(request.getRating())
                .comment(request.getComment())
                .reviewerId(reviewerId)
                .reviewerName(reviewerName)
                .sellerId(sellerId)
                .createdAt(new Date()) // Or let @CreatedDate handle it
                .build();
    }

    public ReviewResponse toResponse(Review review) {
        if (review == null) return null;

        return ReviewResponse.builder()
                .id(review.getId())
                .orderId(review.getOrderId())
                .reviewerId(review.getReviewerId())
                .reviewerName(review.getReviewerName())
                .sellerId(review.getSellerId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
