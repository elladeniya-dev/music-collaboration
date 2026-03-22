package com.harmonix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse {

    private String id;
    private String sellerId;
    private String sellerName;
    private String title;
    private String description;
    private double price;
    private int deliveryTime;
    private String category;
    private List<String> tags;
    private String imageUrl;
    private String audioUrl;
    private Date createdAt;
}
