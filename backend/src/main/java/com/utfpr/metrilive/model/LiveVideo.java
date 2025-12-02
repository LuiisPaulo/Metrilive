package com.utfpr.metrilive.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "live_videos")
public class LiveVideo {

    @Id
    private String id;

    private String title;
    private String description;
    private Date creationTime;

    private Long viewCount;
    private Long commentCount;
    private Long shareCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id")
    private FacebookPage page;
}
