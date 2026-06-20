package com.harmonix.controller;

import com.harmonix.dto.request.JobApplicationCreateRequest;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.dto.response.JobApplicationResponse;
import com.harmonix.entity.User;
import com.harmonix.repository.UserRepository;
import com.harmonix.service.JobApplicationService;
import com.harmonix.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-applications")
@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<JobApplicationResponse>> applyToJob(
            HttpServletRequest request,
            @Valid @RequestBody JobApplicationCreateRequest createRequest) {

        User currentUser = AuthUtil.requireUser(request, userRepository);

        JobApplicationResponse response = jobApplicationService.apply(
                currentUser.getId(),
                createRequest
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<List<JobApplicationResponse>>> getJobApplicants(
            @PathVariable String jobId) {

        List<JobApplicationResponse> responses = jobApplicationService.getApplicantsForJob(jobId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/{applicationId}/accept")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> acceptApplication(
            HttpServletRequest request,
            @PathVariable String applicationId) {

        User currentUser = AuthUtil.requireUser(request, userRepository);

        JobApplicationResponse response = jobApplicationService.acceptApplication(
                applicationId,
                currentUser.getId()
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
