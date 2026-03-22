package com.harmonix.repository;

import com.harmonix.entity.ServiceMarketplace;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends MongoRepository<ServiceMarketplace, String> {
    List<ServiceMarketplace> findByCategory(String category);
    List<ServiceMarketplace> findBySellerId(String sellerId);
}
