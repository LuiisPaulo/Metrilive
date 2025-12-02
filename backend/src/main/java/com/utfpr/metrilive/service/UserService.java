package com.utfpr.metrilive.service;

import com.utfpr.metrilive.model.User;
import com.utfpr.metrilive.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void setFacebookAccessToken(String token) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setFacebookAccessToken(token);
            userRepository.save(user);
        });
    }
}
