package com.harmonix.mapper;

import com.harmonix.dto.response.UserResponse;
import com.harmonix.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profileImage(user.getProfileImage())
                .userType(user.getUserType())
                .role(user.getRole())
                .bio(user.getBio())
                .skills(user.getSkills())
                .tools(user.getTools())
                .genres(user.getGenres())
                .portfolio(user.getPortfolio())
                .level(user.getLevel())
                .badges(user.getBadges())
                .averageRating(user.getAverageRating())
                .totalReviews(user.getTotalReviews())
                .completedOrders(user.getCompletedOrders())
                .availability(user.getAvailability())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
