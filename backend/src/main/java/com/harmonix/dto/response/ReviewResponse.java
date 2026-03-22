package com.harmonix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private String id;
    private String orderId;
    private String reviewerId;
    private String reviewerName;
    private String sellerId;
    private Integer rating;
    private String comment;
    private Date createdAt;
}
