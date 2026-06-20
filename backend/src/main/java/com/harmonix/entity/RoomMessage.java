package com.harmonix.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "room_messages")
public class RoomMessage {
    
    @Id
    private String id;
    
    private String roomId;
    private String senderId;
    private String senderName;
    private String message;
    
    @Builder.Default
    private Instant timestamp = Instant.now();
}
