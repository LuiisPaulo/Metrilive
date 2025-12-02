package com.utfpr.metrilive.repository;

import com.utfpr.metrilive.model.FacebookPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacebookPageRepository extends JpaRepository<FacebookPage, String> {
}
