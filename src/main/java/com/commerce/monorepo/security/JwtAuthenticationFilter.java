package com.commerce.monorepo.security;

import com.commerce.monorepo.repository.UserRepository;
import com.commerce.monorepo.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private static final String[] WHITELIST = {
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/products",
            "/api/products/**",
            "/assets/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/actuator/**",
            "/", "/index.html", "/css/**", "/js/**", "/images/**", "/favicon.ico"
    };

    private boolean isWhitelisted(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

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
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = getTokenFromRequest(request);

        try {
            if (token != null &&
                    jwtTokenProvider.validateToken(token) &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                String email = jwtTokenProvider.getEmail(token);

                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

        }  catch (io.jsonwebtoken.ExpiredJwtException e) {
            logger.warn("JWT expired: " + e.getMessage());

        } catch (io.jsonwebtoken.MalformedJwtException e) {
            logger.error("Malformed JWT: " + e.getMessage());

        } catch (io.jsonwebtoken.SignatureException e) {
            logger.error("Invalid JWT signature: " + e.getMessage());

        } catch (io.jsonwebtoken.JwtException e) {
            logger.error("JWT error: " + e.getMessage());

        } catch (IllegalArgumentException e) {
            logger.error("JWT extraction failed: " + e.getMessage());

        } catch (Exception e) {
            logger.error("Unexpected JWT filter error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {

        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
