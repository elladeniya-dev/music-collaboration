package com.harmonix.repository;

import com.harmonix.entity.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    
    List<Review> findBySellerId(String sellerId);
    
    Optional<Review> findByReviewerIdAndSellerIdAndOrderId(String reviewerId, String sellerId, String orderId);
    
    boolean existsByOrderId(String orderId);
}
