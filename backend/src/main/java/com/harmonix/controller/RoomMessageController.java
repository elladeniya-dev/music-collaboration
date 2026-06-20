package com.harmonix.controller;

import com.harmonix.constant.AppConstants;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.entity.RoomMessage;
import com.harmonix.service.RoomMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AppConstants.API_BASE_PATH + "/collab-rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
public class RoomMessageController {

    private final RoomMessageService roomMessageService;

    @PostMapping("/{roomId}/messages")
    public ResponseEntity<ApiResponse<RoomMessage>> sendMessage(
            @PathVariable String roomId,
            @RequestBody RoomMessage message) {
        message.setRoomId(roomId);
        RoomMessage sent = roomMessageService.sendMessage(message);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", sent));
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<ApiResponse<List<RoomMessage>>> getHistory(@PathVariable String roomId) {
        return ResponseEntity.ok(ApiResponse.success(roomMessageService.getHistory(roomId)));
    }
}
