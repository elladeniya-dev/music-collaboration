package com.harmonix.mapper;

import com.harmonix.dto.response.OrderResponse;
import com.harmonix.entity.Order;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {
    
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
                .build();
    }
}
