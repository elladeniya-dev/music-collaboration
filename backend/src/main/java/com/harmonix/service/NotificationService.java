package com.harmonix.service;

import com.harmonix.dto.response.NotificationResponse;
import com.harmonix.entity.Notification;
import com.harmonix.entity.NotificationType;
import com.harmonix.exception.UnauthorizedException;
import com.harmonix.mapper.NotificationMapper;
import com.harmonix.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    public void createNotification(String userId, NotificationType type, String message, String referenceId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .isRead(false)
                .createdAt(new Date())
                .build();
        
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public void markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to mark this notification as read");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }
}
