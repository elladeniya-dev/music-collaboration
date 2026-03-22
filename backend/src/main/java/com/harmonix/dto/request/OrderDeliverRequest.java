package com.harmonix.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderDeliverRequest {
    
    @NotBlank(message = "Delivery message is required")
    private String deliveryMessage;
    
    @NotBlank(message = "Delivery file URL is required")
    private String deliveryFileUrl;
}
