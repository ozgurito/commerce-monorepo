package com.commerce.api.security;

import com.commerce.api.repo.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        try {
            // 1️⃣ Authorization header'dan token'ı al
            String token = getTokenFromRequest(request);

            // 2️⃣ Token varsa ve geçerliyse
            if (token != null && jwtTokenProvider.validateToken(token)) {
                // 3️⃣ Token'dan email çıkar
                String email = jwtTokenProvider.getEmailFromToken(token);

                // 4️⃣ Kullanıcıyı DB'den bul
                UserDetails userDetails = userRepository.findByEmail(email)
                        .map(user -> new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                new ArrayList<>() // Roller eklenebilir
                        ))
                        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                // 5️⃣ Authentication oluştur
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6️⃣ Security context'e ekle
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            // Token hatalarını logla ama request'i blokla
            logger.error("JWT authentication failed: " + ex.getMessage());
        }

        // 7️⃣ Bir sonraki filter'a geç
        filterChain.doFilter(request, response);
    }

    /**
     * Request'ten Bearer token'ı çıkar
     */
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}