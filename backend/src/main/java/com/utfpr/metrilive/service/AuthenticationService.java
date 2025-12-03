package com.utfpr.metrilive.service;

import com.utfpr.metrilive.controller.dto.AuthenticationRequest;
import com.utfpr.metrilive.controller.dto.AuthenticationResponse;
import com.utfpr.metrilive.controller.dto.RegisterRequest;
import com.utfpr.metrilive.model.User;
import com.utfpr.metrilive.repository.UserRepository;
import com.utfpr.metrilive.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        log.info("Iniciando registro de novo usuário: [{}]", request.getEmail());
        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
        repository.save(user);
        log.info("Usuário registrado com sucesso. ID: [{}]", user.getId());
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.info("Tentativa de autenticação para usuário: [{}]", request.getUsername());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();
        log.info("Usuário autenticado com sucesso: [{}]", user.getUsername());
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .build();
    }

    public void logout(String token) {
        log.info("Invalidando token de sessão.");
        jwtService.invalidateToken(token);
    }
}
