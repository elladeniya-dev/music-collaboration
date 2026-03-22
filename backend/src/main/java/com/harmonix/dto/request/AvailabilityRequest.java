package com.harmonix.dto.request;

import com.harmonix.entity.Availability;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvailabilityRequest {

    @NotNull(message = "Availability status is required")
    private Availability availability;
}
