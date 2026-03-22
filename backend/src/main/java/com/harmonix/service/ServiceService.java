package com.harmonix.service;

import com.harmonix.dto.request.ServiceCreateRequest;
import com.harmonix.dto.response.ServiceResponse;
import com.harmonix.entity.ServiceMarketplace;
import com.harmonix.mapper.ServiceMapper;
import com.harmonix.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final ServiceMapper serviceMapper;

    public ServiceResponse createService(String sellerId, String sellerName, ServiceCreateRequest request) {
        ServiceMarketplace service = serviceMapper.toEntity(request, sellerId, sellerName);
        ServiceMarketplace saved = serviceRepository.save(service);
        return serviceMapper.toResponse(saved);
    }

    public List<ServiceResponse> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(serviceMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<ServiceResponse> getByCategory(String category) {
        return serviceRepository.findByCategory(category).stream()
                .map(serviceMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<ServiceResponse> getBySeller(String sellerId) {
        return serviceRepository.findBySellerId(sellerId).stream()
                .map(serviceMapper::toResponse)
                .collect(Collectors.toList());
    }
}
