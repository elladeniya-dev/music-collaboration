package com.harmonix.mapper;

import com.harmonix.dto.response.OrderResponse;
import com.harmonix.entity.Order;
import com.harmonix.repository.ReviewRepository;
import com.harmonix.repository.UserRepository;
import com.harmonix.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderMapper {
    
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    
    public OrderResponse toResponse(Order order) {
        if (order == null) return null;
        
        return OrderResponse.builder()
                .id(order.getId())
                .serviceId(order.getServiceId())
                .serviceTitle(order.getServiceTitle())
                .buyerId(order.getBuyerId())
                .buyerName(userRepository.findById(order.getBuyerId()).map(User::getName).orElse("Unknown Buyer"))
                .sellerId(order.getSellerId())
                .sellerName(userRepository.findById(order.getSellerId()).map(User::getName).orElse("Unknown Seller"))
                .price(order.getPrice())
                .status(order.getStatus())
                .deliveryMessage(order.getDeliveryMessage())
                .deliveryFileUrl(order.getDeliveryFileUrl())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .isReviewed(reviewRepository.existsByOrderId(order.getId()))
                .build();
    }
}
