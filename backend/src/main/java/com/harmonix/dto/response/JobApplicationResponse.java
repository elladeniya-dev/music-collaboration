package com.harmonix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationResponse {

    private String id;
    private String jobId;
    private String applicantId;
    private String applicantName;
    private Integer applicantLevel;
    private java.util.List<String> applicantBadges;
    private Double applicantRating;
    
    private Double bid;
    private Integer deliveryDays;
    private String coverLetter;
    
    private String status;
    private Instant createdAt;
}
