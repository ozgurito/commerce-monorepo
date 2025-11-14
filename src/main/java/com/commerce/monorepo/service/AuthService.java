// src/main/java/com/commerce/monorepo/service/AuthService.java
package com.commerce.monorepo.service;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.dto.AuthRequest;
import com.commerce.monorepo.dto.AuthResponse;
import com.commerce.monorepo.repository.UserRepository;
import com.commerce.monorepo.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    /** Kullanıcı kaydı */
    @Transactional
    public AuthResponse register(AuthRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "email_taken");
        }
        if (request.fullName() != null && !request.fullName().isBlank()
                && userRepository.existsByFullName(request.fullName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "full_name_taken");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);

        return new AuthResponse(null,null,saved.getId(), saved.getEmail(), saved.getFullName());
    }

    /** Kullanıcı girişi */
    @Transactional()
    public AuthResponse login(AuthRequest request) {
        String email = request.email().trim().toLowerCase(); //Frontendde bu kontrolleri yapacağımız icin backendde bunlara gerek kalmayacak.

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "invalid_credentials"));

        try{
            var a=  authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
            System.out.println(a);
            String accessToken = jwtTokenProvider.generateToken(user.getEmail());
            String refreshRaw=refreshTokenService.create(user.getId());
            return new AuthResponse(accessToken,refreshRaw,user.getId(), user.getEmail(), user.getFullName());
        }
        catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Giriş bilgileri yanlış.");
        }



    }


}
