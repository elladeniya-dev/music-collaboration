package com.harmonix.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ProfileUpdateRequest {

    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String role;

    @Size(max = 1000)
    private String bio;

    private List<String> skills;
    private List<String> tools;
    private List<String> genres;
}
