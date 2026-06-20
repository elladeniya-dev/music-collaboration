package com.harmonix.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationCreateRequest {

    @NotBlank(message = "Job ID is required")
    private String jobId;

    @NotNull(message = "Bid is required")
    private Double bid;

    @NotNull(message = "Delivery days is required")
    private Integer deliveryDays;

    @NotBlank(message = "Cover letter is required")
    private String coverLetter;
}
