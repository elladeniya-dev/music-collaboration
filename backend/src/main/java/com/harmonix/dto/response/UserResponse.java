package com.harmonix.dto.response;

import com.harmonix.entity.Availability;
import com.harmonix.entity.PortfolioItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    
    private String id;
    private String email;
    private String name;
    private String profileImage;
    private String userType;

    // Profile fields
    private String role;
    private String bio;
    private List<String> skills;
    private List<String> tools;
    private List<String> genres;
    private List<PortfolioItem> portfolio;
    
    // Gamification
    private Integer level;
    private List<String> badges;
    
    // Stats
    private double averageRating;
    private int totalReviews;
    private int completedOrders;
    
    private Availability availability;
    private Date createdAt;
}
