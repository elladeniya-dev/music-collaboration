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
@Document(collection = "room_files")
public class RoomFile {
    
    @Id
    private String id;
    
    private String roomId;
    private String uploaderId;
    private String uploaderName;
    private String fileName;
    private String fileUrl;
    private String fileType; // e.g., 'audio', 'doc', 'image'
    private String size; // e.g., "4.5 MB"
    
    @Builder.Default
    private Instant uploadedAt = Instant.now();
}
