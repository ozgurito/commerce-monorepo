package com.commerce.monorepo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // Email gönderimlerinin async çalışması için gerekli
}

