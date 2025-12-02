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
@Table(name = "video_metric_history")
public class VideoMetricHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "live_video_id")
    private LiveVideo liveVideo;

    @Temporal(TemporalType.TIMESTAMP)
    private Date collectedAt;

    private Long viewCount;
    private Long commentCount;
    private Long shareCount;
}
