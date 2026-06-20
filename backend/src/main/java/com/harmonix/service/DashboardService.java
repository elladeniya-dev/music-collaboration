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
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.LocalDate;
import java.util.Map;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.ArrayList;
import com.harmonix.dto.response.ChartData;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;
    private final ReviewMapper reviewMapper;

    public DashboardResponse getDashboardData(String userId) {
        
        // --- SELLER STATS ---
        List<Order> allSellerOrders = orderRepository.findBySellerId(userId);
        
        int totalOrders = allSellerOrders.size();
        
        long activeOrders = allSellerOrders.stream()
                .filter(order -> Arrays.asList(OrderStatus.PENDING, OrderStatus.IN_PROGRESS).contains(order.getStatus()))
                .count();

        List<Order> completedOrdersList = allSellerOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .collect(Collectors.toList());
                
        int completedOrdersCount = completedOrdersList.size();
        
        double totalEarnings = completedOrdersList.stream()
                .mapToDouble(Order::getPrice)
                .sum();
                
        User user = userRepository.findById(userId).orElse(null);
        double averageRating = user != null ? user.getAverageRating() : 0.0;
        int totalReviews = user != null ? user.getTotalReviews() : 0;
        
        List<OrderResponse> recentOrders = allSellerOrders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(5)
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
                
        List<Review> allReviews = reviewRepository.findBySellerId(userId);
        List<ReviewResponse> recentReviews = allReviews.stream()
                .sorted(Comparator.comparing(Review::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(5)
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());

        // --- BUYER STATS ---
        List<Order> allBuyerOrders = orderRepository.findByBuyerId(userId);
        
        int totalOrdersAsBuyer = allBuyerOrders.size();
        
        long activeOrdersAsBuyer = allBuyerOrders.stream()
                .filter(order -> Arrays.asList(OrderStatus.PENDING, OrderStatus.IN_PROGRESS).contains(order.getStatus()))
                .count();

        List<Order> completedBuyerOrdersList = allBuyerOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .collect(Collectors.toList());
                
        int completedOrdersAsBuyerCount = completedBuyerOrdersList.size();
        
        double totalSpent = completedBuyerOrdersList.stream()
                .mapToDouble(Order::getPrice)
                .sum();
                
        List<OrderResponse> recentOrdersAsBuyer = allBuyerOrders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(5)
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());

        // --- GENERATE CHART DATA ---
        List<ChartData> sellerChartData = generateChartData(allSellerOrders);
        List<ChartData> buyerChartData = generateChartData(allBuyerOrders);

        return DashboardResponse.builder()
                .totalOrders(totalOrders)
                .completedOrders(completedOrdersCount)
                .activeOrders((int) activeOrders)
                .totalEarnings(totalEarnings)
                
                .totalOrdersAsBuyer(totalOrdersAsBuyer)
                .completedOrdersAsBuyer(completedOrdersAsBuyerCount)
                .activeOrdersAsBuyer((int) activeOrdersAsBuyer)
                .totalSpent(totalSpent)

                .averageRating(averageRating)
                .totalReviews(totalReviews)
                
                .recentOrders(recentOrders)
                .recentOrdersAsBuyer(recentOrdersAsBuyer)
                .recentReviews(recentReviews)
                
                .sellerChartData(sellerChartData)
                .buyerChartData(buyerChartData)
                .build();
    }
    
    private List<ChartData> generateChartData(List<Order> orders) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        Map<String, ChartData> monthlyData = new LinkedHashMap<>();
        
        // Initialize last 6 months
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            String month = now.minusMonths(i).format(formatter);
            monthlyData.put(month, new ChartData(month, 0.0, 0));
        }
        
        for (Order order : orders) {
            if (order.getStatus() == OrderStatus.COMPLETED && order.getCreatedAt() != null) {
                LocalDate orderDate = order.getCreatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                String month = orderDate.format(formatter);
                
                if (monthlyData.containsKey(month)) {
                    ChartData data = monthlyData.get(month);
                    data.setOrders(data.getOrders() + 1);
                    data.setEarnings(data.getEarnings() + order.getPrice());
                }
            }
        }
        
        return new ArrayList<>(monthlyData.values());
    }
}
