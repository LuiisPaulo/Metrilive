package com.utfpr.metrilive.repository;

import com.utfpr.metrilive.model.LiveVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LiveVideoRepository extends JpaRepository<LiveVideo, String> {
}
