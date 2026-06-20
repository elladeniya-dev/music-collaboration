package com.harmonix.controller;

import com.harmonix.constant.AppConstants;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.entity.CollaborationRequest;
import com.harmonix.entity.Message;
import com.harmonix.entity.User;
import com.harmonix.repository.CollaborationRequestRepository;
import com.harmonix.repository.UserRepository;
import com.harmonix.util.AuthUtil;
import com.harmonix.service.ChatHeadService;
import com.harmonix.service.CollaborationRequestService;
import com.harmonix.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping(AppConstants.COLLABORATION_REQUESTS_PATH)
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
public class CollaborationRequestController {

    private final CollaborationRequestService collaborationRequestService;
    private final MessageService messageService;
    private final ChatHeadService chatHeadService;
    private final UserRepository userRepository;
    private final CollaborationRequestRepository collaborationRequestRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<CollaborationRequest>> createRequest(
            @RequestBody CollaborationRequest req,
            HttpServletRequest request) {
        
        User user = AuthUtil.requireUser(request, userRepository);
        req.setCreatorId(user.getId());
        req.setCreatorEmail(user.getEmail());
        req.setCreatorName(user.getName());
        CollaborationRequest created = collaborationRequestService.create(req);
        return ResponseEntity.ok(ApiResponse.success("Collaboration request created", created));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<CollaborationRequest>> acceptRequest(
            @PathVariable String id,
            HttpServletRequest request) {
        
        User user = AuthUtil.requireUser(request, userRepository);
        CollaborationRequest accepted = collaborationRequestService.accept(id, user.getId());

        return ResponseEntity.ok(ApiResponse.success("Collaboration request joined successfully", accepted));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CollaborationRequest>> getRequestById(@PathVariable String id) {
        CollaborationRequest request = collaborationRequestService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(request));
    }

    @GetMapping("/open")
    public ResponseEntity<ApiResponse<List<CollaborationRequest>>> getOpenRequests() {
        List<CollaborationRequest> requests = collaborationRequestService.getAllOpen();
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<CollaborationRequest>>> getAllVisibleRequests() {
        List<CollaborationRequest> requests = collaborationRequestRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CollaborationRequest>> updateRequest(
            @PathVariable String id,
            @RequestBody CollaborationRequest updated,
            HttpServletRequest request) {
        
        User user = AuthUtil.requireUser(request, userRepository);
        CollaborationRequest updatedRequest = collaborationRequestService.update(id, updated, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Request updated successfully", updatedRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteRequest(
            @PathVariable String id, 
            HttpServletRequest request) {
        
        User user = AuthUtil.requireUser(request, userRepository);
        collaborationRequestService.delete(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Request deleted successfully", null));
    }

    private String generateChatId(String a, String b) {
        return Stream.of(a, b).sorted().collect(Collectors.joining("_"));
    }
}
