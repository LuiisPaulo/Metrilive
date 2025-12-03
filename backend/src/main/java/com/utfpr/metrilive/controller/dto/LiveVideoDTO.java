package com.utfpr.metrilive.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveVideoDTO {
    private String id;
    private String title;
    private String description;
    private Date creationTime;
    private Long viewCount;
    private Long commentCount;
    private Long shareCount;
}
