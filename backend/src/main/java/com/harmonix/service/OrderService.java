package com.harmonix.service;

import com.harmonix.entity.Order;
import com.harmonix.entity.OrderStatus;
import com.harmonix.entity.ServiceMarketplace;
import com.harmonix.entity.NotificationType;
import com.harmonix.exception.ResourceNotFoundException;
import com.harmonix.exception.UnauthorizedException;
import com.harmonix.repository.OrderRepository;
import com.harmonix.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ServiceRepository serviceRepository;
    private final NotificationService notificationService;

    public Order getOrderById(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
    }

    public Order createOrder(String buyerId, String serviceId) {
        ServiceMarketplace service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceMarketplace", "id", serviceId));

        if (service.getSellerId().equals(buyerId)) {
            throw new IllegalArgumentException("You cannot buy your own service.");
        }

        Order order = Order.builder()
                .serviceId(service.getId())
                .serviceTitle(service.getTitle())
                .buyerId(buyerId)
                .sellerId(service.getSellerId())
                .price(service.getPrice())
                .status(OrderStatus.PENDING)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        Order savedOrder = orderRepository.save(order);
        
        notificationService.createNotification(
            service.getSellerId(), 
            NotificationType.ORDER, 
            "New order received: " + service.getTitle(), 
            savedOrder.getId()
        );

        return savedOrder;
    }

    public List<Order> getMyOrders(String userId) {
        List<Order> buyerOrders = orderRepository.findByBuyerId(userId);
        List<Order> sellerOrders = orderRepository.findBySellerId(userId);

        return Stream.concat(buyerOrders.stream(), sellerOrders.stream())
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt())) // Descending by date
                .collect(Collectors.toList());
    }

    public Order acceptOrder(String sellerId, String orderId) {
        Order order = getOrderById(orderId);

        if (!order.getSellerId().equals(sellerId)) {
            throw new UnauthorizedException("Only the seller can accept this order.");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only PENDING orders can be accepted.");
        }

        order.setStatus(OrderStatus.IN_PROGRESS);
        order.setUpdatedAt(new Date());

        return orderRepository.save(order);
    }

    public Order deliverOrder(String sellerId, String orderId, String deliveryMessage, String deliveryFileUrl) {
        Order order = getOrderById(orderId);

        if (!order.getSellerId().equals(sellerId)) {
            throw new UnauthorizedException("Only the seller can deliver this order.");
        }
        if (order.getStatus() != OrderStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only IN_PROGRESS orders can be delivered.");
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveryMessage(deliveryMessage);
        order.setDeliveryFileUrl(deliveryFileUrl);
        order.setUpdatedAt(new Date());

        Order savedOrder = orderRepository.save(order);
        
        notificationService.createNotification(
            order.getBuyerId(),
            NotificationType.ORDER,
            "Your order has been delivered: " + order.getServiceTitle(),
            savedOrder.getId()
        );

        return savedOrder;
    }

    public Order completeOrder(String buyerId, String orderId) {
        Order order = getOrderById(orderId);

        if (!order.getBuyerId().equals(buyerId)) {
            throw new UnauthorizedException("Only the buyer can complete this order.");
        }
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("Only DELIVERED orders can be completed.");
        }

        order.setStatus(OrderStatus.COMPLETED);
        order.setUpdatedAt(new Date());

        return orderRepository.save(order);
    }

    public void cancelOrder(String userId, String orderId) {
        Order order = getOrderById(orderId);

        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new UnauthorizedException("Only the buyer or seller can cancel this order.");
        }

        orderRepository.delete(order);
    }
}
