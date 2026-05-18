package com.commerce.monorepo.ratelimit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final StringRedisTemplate redis;

    public boolean allow(String key, int limit, int windowSeconds) {
        try {
            Long count = redis.opsForValue().increment(key);

            if (count != null && count == 1) {
                redis.expire(key, Duration.ofSeconds(windowSeconds));
            }

            return count != null && count <= limit;
        } catch (Exception e) {
            // Redis erişilemiyorsa rate limit atla (fail-open)
            log.warn("Rate limit Redis erişilemiyor, istek geçiriliyor: {}", e.getMessage());
            return true;
        }
    }
}
