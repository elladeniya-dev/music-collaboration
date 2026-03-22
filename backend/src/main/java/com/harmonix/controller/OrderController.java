package com.harmonix.controller;

import com.harmonix.constant.AppConstants;
import com.harmonix.dto.request.OrderCreateRequest;
import com.harmonix.dto.request.OrderDeliverRequest;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.dto.response.OrderResponse;
import com.harmonix.entity.Order;
import com.harmonix.entity.User;
import com.harmonix.mapper.OrderMapper;
import com.harmonix.repository.UserRepository;
import com.harmonix.service.OrderService;
import com.harmonix.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(AppConstants.ORDERS_PATH)
@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            HttpServletRequest request,
            @Valid @RequestBody OrderCreateRequest createRequest) {

        User currentUser = AuthUtil.requireUser(request, userRepository);
        
        Order order = orderService.createOrder(currentUser.getId(), createRequest.getServiceId());
        OrderResponse response = orderMapper.toResponse(order);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(HttpServletRequest request) {
        User currentUser = AuthUtil.requireUser(request, userRepository);
        
        List<Order> orders = orderService.getMyOrders(currentUser.getId());
        List<OrderResponse> responses = orders.stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<OrderResponse>> acceptOrder(
            HttpServletRequest request,
            @PathVariable String id) {

        User currentUser = AuthUtil.requireUser(request, userRepository);
        
        Order order = orderService.acceptOrder(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toResponse(order)));
    }

    @PutMapping("/{id}/deliver")
    public ResponseEntity<ApiResponse<OrderResponse>> deliverOrder(
            HttpServletRequest request,
            @PathVariable String id,
            @Valid @RequestBody OrderDeliverRequest deliverRequest) {

        User currentUser = AuthUtil.requireUser(request, userRepository);
        
        Order order = orderService.deliverOrder(
                currentUser.getId(), 
                id, 
                deliverRequest.getDeliveryMessage(), 
                deliverRequest.getDeliveryFileUrl()
        );
        
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toResponse(order)));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<OrderResponse>> completeOrder(
            HttpServletRequest request,
            @PathVariable String id) {

        User currentUser = AuthUtil.requireUser(request, userRepository);
        
        Order order = orderService.completeOrder(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toResponse(order)));
    }
}
