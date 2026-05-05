package com.commerce.monorepo.ratelimit;

import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.security.CustomUserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class RateLimitAspect {

    private final RateLimitService rateLimitService;
    private final IpExtract ipExtract;
    private final HttpServletRequest request;

    @Before("@annotation(rateLimit)")
    public void applyRateLimit(JoinPoint jp, RateLimit rateLimit) {

        // ADMIN kullanıcılar için rate limit atlanabilir (toplu işlemler için)
        if (rateLimit.skipForAdmin()) {
            Authentication skipCheck = SecurityContextHolder.getContext().getAuthentication();
            if (skipCheck != null && skipCheck.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return;
            }
        }

        String keyPrefix = rateLimit.key();
        String key;

        // Eğer user bazlı rate limit aktifse (auth sonrası endpointler)
        if (rateLimit.perUser()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth != null && auth.getPrincipal() instanceof CustomUserPrincipal principal) {
                Long userId = principal.getId();
                key = keyPrefix + ":user:" + userId;
            } else {
                // Kullanıcı login değilse fallback olarak ip bazlı uygula
                String ip = ipExtract.getClientIp(request);
                key = keyPrefix + ":ip:" + ip;
            }

        } else {
            // IP bazlı rate limit (login/register gibi)
            String ip = ipExtract.getClientIp(request);
            key = keyPrefix + ":ip:" + ip;
        }

        boolean allowed = rateLimitService.allow(key, rateLimit.limit(), rateLimit.windowSeconds());

        if (!allowed) {
            throw new BaseException(ErrorCode.TOO_MANY_REQUESTS);
        }
    }
}
