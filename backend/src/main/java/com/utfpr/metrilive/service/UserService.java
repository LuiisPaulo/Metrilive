package com.utfpr.metrilive.service;

import com.utfpr.metrilive.controller.dto.RegisterRequest;
import com.utfpr.metrilive.controller.dto.UserUpdateRequest;
import com.utfpr.metrilive.model.FacebookPage;
import com.utfpr.metrilive.model.Role;
import com.utfpr.metrilive.model.User;
import com.utfpr.metrilive.repository.FacebookPageRepository;
import com.utfpr.metrilive.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final FacebookPageRepository facebookPageRepository;
    private final PasswordEncoder passwordEncoder;

    public void setFacebookAccessToken(String token) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Recebida solicitação para atualizar token do Facebook do usuário: {}", username);
        
        userRepository.findByUsername(username).ifPresentOrElse(user -> {
            String oldToken = user.getFacebookAccessToken();
            boolean isNew = !token.equals(oldToken);
            
            user.setFacebookAccessToken(token);
            userRepository.save(user);
            log.info("Token do Facebook atualizado com sucesso para o usuário: {}. Token mudou? {}", username, isNew);
        }, () -> {
            log.error("Falha ao atualizar token: Usuário {} não encontrado no banco.", username);
        });
    }

    public String getEffectiveFacebookToken(User currentUser) {
        if (currentUser.getFacebookAccessToken() != null && !currentUser.getFacebookAccessToken().isEmpty()) {
            return currentUser.getFacebookAccessToken();
        }
        return userRepository.findFirstByRoleAndFacebookAccessTokenIsNotNull(Role.ADMIN)
                .map(User::getFacebookAccessToken)
                .orElseThrow(() -> new RuntimeException("Nenhum token de acesso do Facebook encontrado (nem no usuário atual nem em administradores)."));
    }

    @Transactional
    public User createUser(RegisterRequest request) {
        log.info("Criando novo usuário via admin: [{}]", request.getUsername());
        
        List<FacebookPage> authorizedPages = new ArrayList<>();
        if (request.getAuthorizedPageIds() != null && !request.getAuthorizedPageIds().isEmpty()) {
            authorizedPages = facebookPageRepository.findAllById(request.getAuthorizedPageIds());
        }

        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .authorizedPages(authorizedPages)
                .build();
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o id: " + id));
    }

    @Transactional
    public User updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o id: " + id));

        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getAuthorizedPageIds() != null) {
            List<FacebookPage> pages = facebookPageRepository.findAllById(request.getAuthorizedPageIds());
            user.setAuthorizedPages(pages);
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UsernameNotFoundException("Usuário não encontrado com o id: " + id);
        }
        userRepository.deleteById(id);
    }
}
