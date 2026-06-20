package com.harmonix.service;

import com.harmonix.dto.request.JobApplicationCreateRequest;
import com.harmonix.dto.response.JobApplicationResponse;
import com.harmonix.entity.JobApplication;
import com.harmonix.entity.JobPost;
import com.harmonix.entity.User;
import com.harmonix.exception.BadRequestException;
import com.harmonix.exception.ResourceNotFoundException;
import com.harmonix.repository.JobApplicationRepository;
import com.harmonix.repository.JobPostRepository;
import com.harmonix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;
    
    public JobApplicationResponse apply(String applicantId, JobApplicationCreateRequest request) {
        User applicant = userRepository.findById(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", applicantId));
                
        JobPost job = jobPostRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("JobPost", "id", request.getJobId()));
                
        if (job.getUserId().equals(applicantId)) {
            throw new BadRequestException("You cannot apply to your own job");
        }
        
        JobApplication application = JobApplication.builder()
                .jobId(request.getJobId())
                .applicantId(applicantId)
                .applicantName(applicant.getName())
                .bid(request.getBid())
                .deliveryDays(request.getDeliveryDays())
                .coverLetter(request.getCoverLetter())
                .status("PENDING")
                .build();
                
        JobApplication saved = jobApplicationRepository.save(application);
        return mapToResponse(saved, applicant);
    }
    
    public List<JobApplicationResponse> getApplicantsForJob(String jobId) {
        return jobApplicationRepository.findByJobId(jobId).stream()
                .map(app -> {
                    User applicant = userRepository.findById(app.getApplicantId()).orElse(null);
                    return mapToResponse(app, applicant);
                })
                .collect(Collectors.toList());
    }
    
    public JobApplicationResponse acceptApplication(String applicationId, String jobOwnerId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", applicationId));
                
        JobPost job = jobPostRepository.findById(application.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("JobPost", "id", application.getJobId()));
                
        if (!job.getUserId().equals(jobOwnerId)) {
            throw new BadRequestException("You are not authorized to accept applications for this job");
        }
        
        application.setStatus("ACCEPTED");
        JobApplication saved = jobApplicationRepository.save(application);
        
        User applicant = userRepository.findById(saved.getApplicantId()).orElse(null);
        return mapToResponse(saved, applicant);
    }
    
    private JobApplicationResponse mapToResponse(JobApplication app, User applicant) {
        return JobApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJobId())
                .applicantId(app.getApplicantId())
                .applicantName(app.getApplicantName())
                .bid(app.getBid())
                .deliveryDays(app.getDeliveryDays())
                .coverLetter(app.getCoverLetter())
                .status(app.getStatus())
                .createdAt(app.getCreatedAt())
                .applicantLevel(applicant != null && applicant.getLevel() != null ? applicant.getLevel() : 1)
                .applicantBadges(applicant != null && applicant.getBadges() != null ? applicant.getBadges() : java.util.List.of("Newcomer"))
                .applicantRating(applicant != null ? applicant.getAverageRating() : 0.0)
                .build();
    }
}
