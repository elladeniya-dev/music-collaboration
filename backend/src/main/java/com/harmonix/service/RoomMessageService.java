package com.harmonix.service;

import com.harmonix.entity.RoomMessage;
import com.harmonix.repository.RoomMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomMessageService {

    private final RoomMessageRepository roomMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public RoomMessage sendMessage(RoomMessage msg) {
        msg.setTimestamp(Instant.now());
        RoomMessage saved = roomMessageRepository.save(msg);
        
        // Broadcast to the room's WebSocket topic
        messagingTemplate.convertAndSend("/topic/room/" + saved.getRoomId(), saved);
        
        return saved;
    }

    public List<RoomMessage> getHistory(String roomId) {
        return roomMessageRepository.findByRoomId(roomId, Sort.by(Sort.Direction.ASC, "timestamp"));
    }
}
