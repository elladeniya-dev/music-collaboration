package com.harmonix.controller;

import com.harmonix.entity.Message;
import com.harmonix.entity.User;
import com.harmonix.repository.UserRepository;
import com.harmonix.service.MessageService;
import com.harmonix.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;

/**
 * WebSocket controller for real-time chat messaging
 * Professional approach using STOMP protocol over WebSocket
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    /**
     * Handle messages sent to /app/chat
     * Broadcast to specific chat room
     */
    @MessageMapping("/chat")
    public void sendMessage(@Payload Message message, Principal principal) {
        try {
            // Set timestamp
            message.setTimestamp(Instant.now());
            message.setStatus("sent");
            
            // Save message to database
            Message savedMessage = messageService.sendMessage(message);
            
            log.info("WebSocket message sent - ChatId: {}, From: {}, To: {}", 
                    savedMessage.getChatId(), savedMessage.getSenderId(), savedMessage.getReceiverId());
            
            // Send to specific chat room (both participants will receive)
            messagingTemplate.convertAndSend(
                    "/topic/chat/" + savedMessage.getChatId(), 
                    savedMessage
            );
            
            // Also send to receiver's personal queue for notifications
            messagingTemplate.convertAndSend(
                    "/queue/messages/" + savedMessage.getReceiverId(), 
                    savedMessage
            );
            
        } catch (Exception e) {
            log.error("Error sending WebSocket message: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle typing indicator
     */
    @MessageMapping("/typing")
    public void handleTyping(@Payload TypingIndicator indicator) {
        log.info("Typing indicator - ChatId: {}, UserId: {}, isTyping: {}", 
                indicator.getChatId(), indicator.getUserId(), indicator.isTyping());
        messagingTemplate.convertAndSend(
                "/topic/chat/" + indicator.getChatId() + "/typing", 
                indicator
        );
    }

    /**
     * Handle message status updates (delivered, read)
     */
    @MessageMapping("/message/status")
    public void updateMessageStatus(@Payload MessageStatusUpdate statusUpdate) {
        try {
            // Update message status in database if needed
            log.info("Message status update - MessageId: {}, Status: {}", 
                    statusUpdate.getMessageId(), statusUpdate.getStatus());
            
            // Broadcast status update
            messagingTemplate.convertAndSend(
                    "/topic/chat/" + statusUpdate.getChatId() + "/status", 
                    statusUpdate
            );
        } catch (Exception e) {
            log.error("Error updating message status: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle presence (online/offline) indicator
     */
    @MessageMapping("/presence")
    public void handlePresence(@Payload PresenceIndicator indicator) {
        log.info("Presence update - UserId: {}, online: {}", 
                indicator.getUserId(), indicator.isOnline());
        messagingTemplate.convertAndSend("/topic/presence", indicator);
    }

    @MessageMapping("/presence/check")
    public void checkPresence(@Payload String targetUserId) {
        boolean isOnline = com.harmonix.config.WebSocketEventListener.isUserOnline(targetUserId);
        PresenceIndicator indicator = new PresenceIndicator(targetUserId, isOnline);
        messagingTemplate.convertAndSend("/topic/presence", indicator);
    }

    // Inner classes for WebSocket payloads
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TypingIndicator {
        private String chatId;
        private String userId;
        private String userName;
        private boolean isTyping;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class MessageStatusUpdate {
        private String messageId;
        private String chatId;
        private String status; // "delivered", "read"
        private String userId;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class PresenceIndicator {
        private String userId;
        private boolean online; // Matches JSON "online"
    }
}
