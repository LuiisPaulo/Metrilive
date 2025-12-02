package com.utfpr.metrilive.repository;

import com.utfpr.metrilive.model.VideoMetricHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoMetricHistoryRepository extends JpaRepository<VideoMetricHistory, Long> {
}
