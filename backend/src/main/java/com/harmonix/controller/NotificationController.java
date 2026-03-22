package com.harmonix.controller;

import com.harmonix.constant.AppConstants;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.dto.response.NotificationResponse;
import com.harmonix.entity.User;
import com.harmonix.repository.UserRepository;
import com.harmonix.service.NotificationService;
import com.harmonix.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AppConstants.NOTIFICATIONS_PATH)
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications(HttpServletRequest request) {
        User user = AuthUtil.requireUser(request, userRepository);
        List<NotificationResponse> notifications = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notifications));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String id, HttpServletRequest request) {
        User user = AuthUtil.requireUser(request, userRepository);
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }
}
