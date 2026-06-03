package com.harmonix.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    
    // Track sessions to userId: SessionId -> UserId
    private static final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();
    
    // Track active users: UserId -> count of sessions
    private static final Map<String, Integer> activeUsers = new ConcurrentHashMap<>();

    public static boolean isUserOnline(String userId) {
        return activeUsers.containsKey(userId) && activeUsers.get(userId) > 0;
    }

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        
        String userId = headers.getFirstNativeHeader("userId");
        String sessionId = headers.getSessionId();
        
        if (userId != null && sessionId != null) {
            sessionUserMap.put(sessionId, userId);
            int count = activeUsers.getOrDefault(userId, 0) + 1;
            activeUsers.put(userId, count);
            
            log.info("User connected (Native Header): {}, Total sessions: {}", userId, count);
            
            // Broadcast user online status
            broadcastPresence(userId, true);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        
        String userId = sessionUserMap.remove(sessionId);
        
        if (userId != null) {
            int count = activeUsers.getOrDefault(userId, 1) - 1;
            if (count <= 0) {
                activeUsers.remove(userId);
                log.info("User completely disconnected: {}", userId);
                broadcastPresence(userId, false);
            } else {
                activeUsers.put(userId, count);
            }
        }
    }
    
    private void broadcastPresence(String userId, boolean isOnline) {
        PresenceIndicator indicator = new PresenceIndicator(userId, isOnline);
        messagingTemplate.convertAndSend("/topic/presence", indicator);
    }
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class PresenceIndicator {
        private String userId;
        private boolean online; // matches JSON 'online'
    }
}
