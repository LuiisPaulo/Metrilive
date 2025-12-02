package com.utfpr.metrilive.repository;

import com.utfpr.metrilive.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
}
