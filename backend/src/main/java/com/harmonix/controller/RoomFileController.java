package com.harmonix.controller;

import com.harmonix.constant.AppConstants;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.entity.RoomFile;
import com.harmonix.entity.User;
import com.harmonix.repository.UserRepository;
import com.harmonix.service.RoomFileService;
import com.harmonix.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping(AppConstants.API_BASE_PATH + "/collab-rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
public class RoomFileController {

    private final RoomFileService roomFileService;
    private final UserRepository userRepository;

    @PostMapping("/{roomId}/files")
    public ResponseEntity<ApiResponse<RoomFile>> uploadFile(
            @PathVariable String roomId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
            
        User user = AuthUtil.requireUser(request, userRepository);
        RoomFile uploaded = roomFileService.uploadFile(roomId, user.getId(), user.getName(), file);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", uploaded));
    }

    @GetMapping("/{roomId}/files")
    public ResponseEntity<ApiResponse<List<RoomFile>>> getFiles(@PathVariable String roomId) {
        return ResponseEntity.ok(ApiResponse.success(roomFileService.getFilesForRoom(roomId)));
    }
}
