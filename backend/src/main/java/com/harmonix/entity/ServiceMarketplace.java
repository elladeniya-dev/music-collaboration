package com.harmonix.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "services")
public class ServiceMarketplace {

    @Id
    private String id;

    private String sellerId;
    private String sellerName;
    private String title;
    private String description;
    private double price;
    private int deliveryTime;
    private String category;
    private List<String> tags;
    private Date createdAt;
}
