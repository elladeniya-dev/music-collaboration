package com.harmonix.service;

import com.harmonix.entity.RoomFile;
import com.harmonix.repository.RoomFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomFileService {

    private final RoomFileRepository roomFileRepository;
    private final CloudinaryService cloudinaryService;

    public RoomFile uploadFile(String roomId, String uploaderId, String uploaderName, MultipartFile file) {
        String fileUrl = cloudinaryService.uploadMedia(file);
        
        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();
        String fileType = "doc";
        
        if (contentType != null) {
            if (contentType.startsWith("audio/")) fileType = "audio";
            else if (contentType.startsWith("image/")) fileType = "image";
            else if (contentType.startsWith("video/")) fileType = "video";
        }

        long bytes = file.getSize();
        String sizeStr = bytes < 1024 * 1024 ? 
            (bytes / 1024) + " KB" : 
            String.format("%.1f MB", bytes / (1024.0 * 1024.0));

        RoomFile roomFile = RoomFile.builder()
                .roomId(roomId)
                .uploaderId(uploaderId)
                .uploaderName(uploaderName)
                .fileName(originalFilename)
                .fileUrl(fileUrl)
                .fileType(fileType)
                .size(sizeStr)
                .uploadedAt(Instant.now())
                .build();
                
        return roomFileRepository.save(roomFile);
    }

    public List<RoomFile> getFilesForRoom(String roomId) {
        return roomFileRepository.findByRoomId(roomId, Sort.by(Sort.Direction.DESC, "uploadedAt"));
    }
}
