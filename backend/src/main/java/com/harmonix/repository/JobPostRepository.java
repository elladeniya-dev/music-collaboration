package com.harmonix.repository;

import com.harmonix.entity.JobPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostRepository extends MongoRepository<JobPost, String> {
    List<JobPost> findByUserId(String userId);
    List<JobPost> findByTitleContainingIgnoreCaseOrSkillsNeededContainingIgnoreCase(String title, String skills);
}
