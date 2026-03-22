package com.harmonix.dto.response;

import com.harmonix.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    
    private String id;
    private String serviceId;
    private String serviceTitle;
    private String buyerId;
    private String sellerId;
    private double price;
    private OrderStatus status;
    private String deliveryMessage;
    private String deliveryFileUrl;
    private Date createdAt;
    private Date updatedAt;
}
