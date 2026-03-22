package com.harmonix.controller;

import com.harmonix.constant.AppConstants;
import com.harmonix.dto.request.JobPostCreateRequest;
import com.harmonix.dto.request.JobPostUpdateRequest;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.dto.response.JobPostResponse;
import com.harmonix.entity.JobPost;
import com.harmonix.entity.User;
import com.harmonix.exception.BadRequestException;
import com.harmonix.exception.ResourceNotFoundException;
import com.harmonix.repository.JobPostRepository;
import com.harmonix.repository.UserRepository;
import com.harmonix.service.CloudinaryService;
import com.harmonix.service.JobPostService;
import com.harmonix.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping(AppConstants.JOB_POSTS_PATH)
@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class JobPostController {

    private final JobPostService jobPostService;
    private final UserRepository userRepository;
    private final JobPostRepository jobPostRepository;
    private final CloudinaryService cloudinaryService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<JobPostResponse>> createJobPost(
            HttpServletRequest request,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("skillsNeeded") String skillsNeeded,
            @RequestPart("collaborationType") String collaborationType,
            @RequestPart("availability") String availability,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        User user = AuthUtil.requireUser(request, userRepository);

        String imageUrl = safeUploadImage(image, "create");

        JobPostCreateRequest createRequest = new JobPostCreateRequest(
                title, description, skillsNeeded, collaborationType,
                availability, user.getEmail(), imageUrl
        );

        JobPostResponse response = jobPostService.createJobPost(user.getId(), createRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job post created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobPostResponse>>> getAllJobPosts() {
        List<JobPostResponse> jobPosts = jobPostService.getAllJobPosts();
        return ResponseEntity.ok(ApiResponse.success(jobPosts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPostResponse>> getJobPostById(@PathVariable String id) {
        JobPostResponse jobPost = jobPostService.getJobPostById(id);
        return ResponseEntity.ok(ApiResponse.success(jobPost));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPostResponse>> updateJobPost(
            HttpServletRequest request,
            @PathVariable("id") String id,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("skillsNeeded") String skillsNeeded,
            @RequestPart("collaborationType") String collaborationType,
            @RequestPart("availability") String availability,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        User user = AuthUtil.requireUser(request, userRepository);

        JobPost existingJob = jobPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobPost", "id", id));

        if (!existingJob.getUserId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to update this job post");
        }

        String imageUrl = existingJob.getImageUrl();
        String uploadedImageUrl = safeUploadImage(image, "update");
        if (uploadedImageUrl != null) {
            imageUrl = uploadedImageUrl;
        }

        JobPostUpdateRequest updateRequest = new JobPostUpdateRequest(
                title, description, skillsNeeded, collaborationType,
                availability, user.getEmail(), imageUrl
        );

        JobPostResponse response = jobPostService.updateJobPost(id, updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Job post updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteJobPost(
            HttpServletRequest request,
            @PathVariable("id") String id
    ) {
        User user = AuthUtil.requireUser(request, userRepository);

        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobPost", "id", id));

        if (!jobPost.getUserId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to delete this job post");
        }

        jobPostService.deleteJobPost(id);
        return ResponseEntity.ok(ApiResponse.success("Job post deleted successfully", null));
    }

    private String safeUploadImage(MultipartFile image, String action) {
        if (image == null || image.isEmpty()) {
            return null;
        }

        try {
            return cloudinaryService.uploadImage(image);
        } catch (Exception ex) {
            log.warn("Job post image upload failed during {} for '{}' ({} bytes): {}",
                    action,
                    image.getOriginalFilename(),
                    image.getSize(),
                    ex.getMessage());
            return null;
        }
    }
}
