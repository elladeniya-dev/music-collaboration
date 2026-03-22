package com.harmonix.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    private String orderId;
    
    private String reviewerId;
    private String reviewerName;
    
    // The user who provided the service
    private String sellerId;

    private Integer rating;
    private String comment;

    @CreatedDate
    private Date createdAt;
}
