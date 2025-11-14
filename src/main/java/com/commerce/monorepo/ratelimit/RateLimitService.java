package com.commerce.monorepo.ratelimit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final StringRedisTemplate redis;

    public boolean allow(String key, int limit, int windowSeconds) {
        Long count = redis.opsForValue().increment(key);

        if (count != null && count == 1) {
            redis.expire(key, Duration.ofSeconds(windowSeconds));
        }

        return count != null && count <= limit;
    }
}
