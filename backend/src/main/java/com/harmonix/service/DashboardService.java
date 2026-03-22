package com.harmonix.service;

import com.harmonix.dto.response.DashboardResponse;
import com.harmonix.dto.response.OrderResponse;
import com.harmonix.dto.response.ReviewResponse;
import com.harmonix.entity.Order;
import com.harmonix.entity.OrderStatus;
import com.harmonix.entity.Review;
import com.harmonix.entity.User;
import com.harmonix.mapper.OrderMapper;
import com.harmonix.mapper.ReviewMapper;
import com.harmonix.repository.OrderRepository;
import com.harmonix.repository.ReviewRepository;
import com.harmonix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;
    private final ReviewMapper reviewMapper;

    public DashboardResponse getDashboardData(String sellerId) {
        
        List<Order> allSellerOrders = orderRepository.findBySellerId(sellerId);
        
        int totalOrders = allSellerOrders.size();
        
        long activeOrders = allSellerOrders.stream()
                .filter(order -> Arrays.asList(OrderStatus.PENDING, OrderStatus.IN_PROGRESS).contains(order.getStatus()))
                .count();

        List<Order> completedOrdersList = allSellerOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .collect(Collectors.toList());
                
        int completedOrdersCount = completedOrdersList.size();
        
        double totalEarnings = completedOrdersList.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .mapToDouble(Order::getPrice)
                .sum();
                
        User seller = userRepository.findById(sellerId).orElse(null);
        double averageRating = seller != null ? seller.getAverageRating() : 0.0;
        int totalReviews = seller != null ? seller.getTotalReviews() : 0;
        
        List<OrderResponse> recentOrders = allSellerOrders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(5)
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
                
        List<Review> allReviews = reviewRepository.findBySellerId(sellerId);
        List<ReviewResponse> recentReviews = allReviews.stream()
                .sorted(Comparator.comparing(Review::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(5)
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalOrders(totalOrders)
                .completedOrders(completedOrdersCount)
                .activeOrders((int) activeOrders)
                .totalEarnings(totalEarnings)
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .recentOrders(recentOrders)
                .recentReviews(recentReviews)
                .build();
    }
}
