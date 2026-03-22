package com.harmonix.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String serviceId;
    private String serviceTitle;
    
    private String buyerId;
    private String sellerId;
    
    private double price;
    
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;
    
    private String deliveryMessage;
    private String deliveryFileUrl;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;
}
