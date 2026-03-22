package com.harmonix.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioItem {
    private String id;
    private String title;
    private MediaType type;
    private String url;
    private Date createdAt;
}
