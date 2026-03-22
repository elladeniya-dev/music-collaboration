package com.harmonix.service;

import com.harmonix.dto.request.ReviewCreateRequest;
import com.harmonix.dto.response.ReviewResponse;
import com.harmonix.entity.Order;
import com.harmonix.entity.OrderStatus;
import com.harmonix.entity.Review;
import com.harmonix.entity.NotificationType;
import com.harmonix.entity.User;
import com.harmonix.mapper.ReviewMapper;
import com.harmonix.repository.OrderRepository;
import com.harmonix.repository.ReviewRepository;
import com.harmonix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;
    private final NotificationService notificationService;

    public ReviewResponse addReview(String reviewerId, String reviewerName, ReviewCreateRequest request) {
        
        // 1. Validate Order
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + request.getOrderId()));

        // 2. Validate Order is COMPLETED
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new RuntimeException("You can only review completed orders");
        }

        // 3. Validate current user is the buyer
        if (!order.getBuyerId().equals(reviewerId)) {
            throw new RuntimeException("Only the buyer can leave a review for this order");
        }

        // 4. Prevent duplicate reviews
        if (reviewRepository.existsByOrderId(request.getOrderId())) {
            throw new RuntimeException("You have already reviewed this order");
        }

        // 5. Create Review
        Review review = reviewMapper.toEntity(request, reviewerId, reviewerName, order.getSellerId());
        Review savedReview = reviewRepository.save(review);

        // 6. Update Seller Rating
        updateSellerRating(order.getSellerId());

        // 7. Send Notification
        notificationService.createNotification(
            order.getSellerId(),
            NotificationType.REVIEW,
            reviewerName + " left a " + request.getRating() + "-star review on your order",
            order.getId()
        );

        return reviewMapper.toResponse(savedReview);
    }

    public List<ReviewResponse> getReviewsBySeller(String sellerId) {
        return reviewRepository.findBySellerId(sellerId).stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    private void updateSellerRating(String sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        List<Review> sellerReviews = reviewRepository.findBySellerId(sellerId);
        
        if (sellerReviews.isEmpty()) {
            seller.setTotalReviews(0);
            seller.setAverageRating(0.0);
        } else {
            double totalRating = sellerReviews.stream()
                    .mapToDouble(Review::getRating)
                    .sum();
            
            double avg = totalRating / sellerReviews.size();
            
            seller.setTotalReviews(sellerReviews.size());
            // Round to 1 decimal place
            seller.setAverageRating(Math.round(avg * 10.0) / 10.0);
        }

        userRepository.save(seller);
    }
}
