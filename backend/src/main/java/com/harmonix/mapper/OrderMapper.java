package com.harmonix.mapper;

import com.harmonix.dto.response.OrderResponse;
import com.harmonix.entity.Order;
import com.harmonix.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderMapper {
    
    private final ReviewRepository reviewRepository;
    
    public OrderResponse toResponse(Order order) {
        if (order == null) return null;
        
        return OrderResponse.builder()
                .id(order.getId())
                .serviceId(order.getServiceId())
                .serviceTitle(order.getServiceTitle())
                .buyerId(order.getBuyerId())
                .sellerId(order.getSellerId())
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
