package com.commerce.monorepo.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.email")
public class EmailProperties {
    private String from = "noreply@yourstore.com";
    private String fromName = "Your Store";
}

