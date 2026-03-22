package com.harmonix.mapper;

import com.harmonix.dto.request.ServiceCreateRequest;
import com.harmonix.dto.response.ServiceResponse;
import com.harmonix.entity.ServiceMarketplace;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class ServiceMapper {

    public ServiceMarketplace toEntity(ServiceCreateRequest request, String sellerId, String sellerName) {
        if (request == null) {
            return null;
        }

        return ServiceMarketplace.builder()
                .sellerId(sellerId)
                .sellerName(sellerName)
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .deliveryTime(request.getDeliveryTime())
                .category(request.getCategory())
                .tags(request.getTags())
            .imageUrl(request.getImageUrl())
            .audioUrl(request.getAudioUrl())
                .createdAt(new Date())
                .build();
    }

    public ServiceResponse toResponse(ServiceMarketplace service) {
        if (service == null) {
            return null;
        }

        return ServiceResponse.builder()
                .id(service.getId())
                .sellerId(service.getSellerId())
                .sellerName(service.getSellerName())
                .title(service.getTitle())
                .description(service.getDescription())
                .price(service.getPrice())
                .deliveryTime(service.getDeliveryTime())
                .category(service.getCategory())
                .tags(service.getTags())
                .imageUrl(service.getImageUrl())
                .audioUrl(service.getAudioUrl())
                .createdAt(service.getCreatedAt())
                .build();
    }
}
