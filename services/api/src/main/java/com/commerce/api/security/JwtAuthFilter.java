// src/main/java/com/commerce/api/security/JwtAuthFilter.java
package com.commerce.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private static final String[] WHITELIST = {
            "/api/auth/login",
            "/api/auth/register",
            "/api/products",
            "/api/products/**",
            "/assets/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/actuator/**",
            "/", "/index.html", "/css/**", "/js/**", "/images/**", "/favicon.ico"
    };

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    private boolean isWhitelisted(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // OPTIONS always allowed
        if ("OPTIONS".equals(method)) {
            return true;
        }

        for (String pattern : WHITELIST) {
            if (PATH_MATCHER.match(pattern, path)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return isWhitelisted(request);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"unauthorized\",\"message\":\"Missing or invalid token\"}");
            return;
        }

        String token = header.substring(7);

        if (!jwtUtil.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"unauthorized\",\"message\":\"Invalid or expired token\"}");
            return;
        }

        // Token'dan bilgileri al ve request'e ekle
        Long userId = jwtUtil.getUserIdFromToken(token);
        String email = jwtUtil.getEmailFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        request.setAttribute("userId", userId);
        request.setAttribute("email", email);
        request.setAttribute("role", role);

        chain.doFilter(request, response);
    }
}