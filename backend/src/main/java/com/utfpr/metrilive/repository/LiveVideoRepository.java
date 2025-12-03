package com.utfpr.metrilive.repository;

import com.utfpr.metrilive.model.LiveVideo;
import com.utfpr.metrilive.repository.projection.DashboardProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LiveVideoRepository extends JpaRepository<LiveVideo, String> {

    @Query(value = """
            SELECT
                CAST(v.creation_time AS DATE) as date,
                'VIDEO' as type,
                COALESCE(SUM(v.view_count), 0) as totalViews,
                COALESCE(SUM(v.comment_count), 0) as totalComments,
                COALESCE(SUM(v.share_count), 0) as totalShares
            FROM live_videos v
            GROUP BY CAST(v.creation_time AS DATE)
            ORDER BY date DESC
            """, nativeQuery = true)
    List<DashboardProjection> getDashboardMetricsForAdmin();

    @Query(value = """
            SELECT
                CAST(v.creation_time AS DATE) as date,
                'VIDEO' as type,
                COALESCE(SUM(v.view_count), 0) as totalViews,
                COALESCE(SUM(v.comment_count), 0) as totalComments,
                COALESCE(SUM(v.share_count), 0) as totalShares
            FROM live_videos v
            JOIN facebook_pages p ON v.page_id = p.id
            JOIN user_facebook_pages ufp ON p.id = ufp.page_id
            WHERE ufp.user_id = :userId
            GROUP BY CAST(v.creation_time AS DATE)
            ORDER BY date DESC
            """, nativeQuery = true)
    List<DashboardProjection> getDashboardMetricsForUser(Long userId);
}
