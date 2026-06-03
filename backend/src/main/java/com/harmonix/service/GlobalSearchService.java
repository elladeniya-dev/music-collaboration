package com.harmonix.service;

import com.harmonix.dto.response.GlobalSearchResponse;
import com.harmonix.dto.response.JobPostResponse;
import com.harmonix.dto.response.ServiceResponse;
import com.harmonix.dto.response.UserResponse;
import com.harmonix.mapper.JobPostMapper;
import com.harmonix.mapper.ServiceMapper;
import com.harmonix.mapper.UserMapper;
import com.harmonix.repository.JobPostRepository;
import com.harmonix.repository.ServiceRepository;
import com.harmonix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GlobalSearchService {

    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final JobPostRepository jobPostRepository;
    
    private final UserMapper userMapper;
    private final ServiceMapper serviceMapper;
    private final JobPostMapper jobPostMapper;

    public GlobalSearchResponse globalSearch(String query) {
        if (query == null || query.trim().isEmpty()) {
            return GlobalSearchResponse.builder()
                    .users(List.of())
                    .services(List.of())
                    .jobs(List.of())
                    .build();
        }

        String q = query.trim();

        // 1. Search Users
        List<UserResponse> users = userRepository.findByNameContainingIgnoreCase(q)
                .stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());

        // 2. Search Services
        List<ServiceResponse> services = serviceRepository.findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(q, q)
                .stream()
                .map(serviceMapper::toResponse)
                .collect(Collectors.toList());

        // 3. Search Jobs
        List<JobPostResponse> jobs = jobPostRepository.findByTitleContainingIgnoreCaseOrSkillsNeededContainingIgnoreCase(q, q)
                .stream()
                .map(jobPostMapper::toResponse)
                .collect(Collectors.toList());

        return GlobalSearchResponse.builder()
                .users(users)
                .services(services)
                .jobs(jobs)
                .build();
    }
}
