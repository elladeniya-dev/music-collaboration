package com.harmonix.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    
    private String name;
    private String profileImage;
    private String userType;

    // Profile fields
    private String role;
    private String bio;
    
    @Builder.Default
    private List<String> skills = new ArrayList<>();
    
    @Builder.Default
    private List<String> tools = new ArrayList<>();
    
    @Builder.Default
    private List<String> genres = new ArrayList<>();
    
    @Builder.Default
    private List<PortfolioItem> portfolio = new ArrayList<>();
    
    // Stats
    private double averageRating;
    private int totalReviews;
    private int completedOrders;
    
    @Builder.Default
    private Availability availability = Availability.AVAILABLE;

    @CreatedDate
    private Date createdAt;
}
