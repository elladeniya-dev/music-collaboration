package com.harmonix.service;

import com.harmonix.dto.request.AvailabilityRequest;
import com.harmonix.dto.request.PortfolioRequest;
import com.harmonix.dto.request.ProfileUpdateRequest;
import com.harmonix.entity.PortfolioItem;
import com.harmonix.entity.User;
import com.harmonix.exception.ResourceNotFoundException;
import com.harmonix.repository.UserRepository;
import com.harmonix.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    public java.util.List<User> searchUsersByName(String nameQuery) {
        if (nameQuery == null || nameQuery.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return userRepository.findByNameContainingIgnoreCase(nameQuery.trim());
    }

    public User getCurrentUserProfile(HttpServletRequest request) {
        return AuthUtil.requireUser(request, userRepository);
    }

    public User updateProfile(String userId, ProfileUpdateRequest dto) {
        User user = getUserById(userId);

        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getRole() != null) user.setRole(dto.getRole());
        if (dto.getBio() != null) user.setBio(dto.getBio());
        if (dto.getSkills() != null) user.setSkills(dto.getSkills());
        if (dto.getTools() != null) user.setTools(dto.getTools());
        if (dto.getGenres() != null) user.setGenres(dto.getGenres());

        return userRepository.save(user);
    }

    public User addPortfolioItem(String userId, PortfolioRequest dto) {
        User user = getUserById(userId);

        PortfolioItem item = PortfolioItem.builder()
                .id(UUID.randomUUID().toString())
                .title(dto.getTitle())
                .type(dto.getType())
                .url(dto.getUrl())
                .createdAt(new Date())
                .build();

        user.getPortfolio().add(0, item); // Add to beginning of list
        return userRepository.save(user);
    }

    public User deletePortfolioItem(String userId, String portfolioId) {
        User user = getUserById(userId);

        boolean removed = user.getPortfolio().removeIf(item -> item.getId().equals(portfolioId));
        
        if (!removed) {
            throw new ResourceNotFoundException("PortfolioItem", "id", portfolioId);
        }

        return userRepository.save(user);
    }

    public User updateAvailability(String userId, AvailabilityRequest dto) {
        User user = getUserById(userId);
        
        if (dto.getAvailability() != null) {
            user.setAvailability(dto.getAvailability());
        }

        return userRepository.save(user);
    }
}
