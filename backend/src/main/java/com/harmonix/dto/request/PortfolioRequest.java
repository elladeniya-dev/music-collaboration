package com.harmonix.dto.request;

import com.harmonix.entity.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PortfolioRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Media type is required")
    private MediaType type;

    @NotBlank(message = "URL is required")
    private String url;
}
