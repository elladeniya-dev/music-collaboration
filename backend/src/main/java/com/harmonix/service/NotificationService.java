package com.harmonix.service;

import com.harmonix.dto.response.NotificationResponse;
import com.harmonix.entity.Notification;
import com.harmonix.entity.NotificationType;
import com.harmonix.exception.UnauthorizedException;
import com.harmonix.mapper.NotificationMapper;
import com.harmonix.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public void createNotification(String userId, NotificationType type, String message, String referenceId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .isRead(false)
                .createdAt(new Date())
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);
        
        // Broadcast notification to user
        try {
            NotificationResponse response = notificationMapper.toResponse(savedNotification);
            messagingTemplate.convertAndSend("/queue/notifications/" + userId, response);
        } catch (Exception e) {
            // Log but don't fail the transaction if WebSocket broadcast fails
            System.err.println("Error broadcasting notification: " + e.getMessage());
        }
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

    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());
        
        if (!unreadNotifs.isEmpty()) {
            unreadNotifs.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(unreadNotifs);
        }
    }
}
