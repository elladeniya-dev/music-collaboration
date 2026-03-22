package com.harmonix.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderCreateRequest {
    
    @NotBlank(message = "Service ID is required")
    private String serviceId;
}
