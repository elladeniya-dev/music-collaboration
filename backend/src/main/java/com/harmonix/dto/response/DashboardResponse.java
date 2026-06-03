package com.harmonix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private int totalOrders;
    private int completedOrders;
    private int activeOrders;
    private double totalEarnings;
    
    // Buyer Stats
    private int totalOrdersAsBuyer;
    private int completedOrdersAsBuyer;
    private int activeOrdersAsBuyer;
    private double totalSpent;

    private double averageRating;
    private int totalReviews;
    
    private List<OrderResponse> recentOrders;
    private List<OrderResponse> recentOrdersAsBuyer;
    private List<ReviewResponse> recentReviews;
}
