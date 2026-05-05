package com.commerce.monorepo.ratelimit;

import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RateLimit {
    String key();
    int limit();
    int windowSeconds();
    boolean perUser() default false;
    /** true ise ADMIN rolündeki kullanıcılar bu endpoint'te rate limit'e tabi tutulmaz. */
    boolean skipForAdmin() default false;
}
