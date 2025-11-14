package com.commerce.monorepo.ratelimit;

import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RateLimit {
    String key();
    int limit();
    int windowSeconds();
    boolean perUser() default false;
}
