package com.commerce.monorepo.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "iyzico")
public class IyzicoProperties {
    /**
     * Sandbox: https://sandbox-api.iyzipay.com
     * Prod: https://api.iyzipay.com
     */
    private String baseUrl = "https://sandbox-api.iyzipay.com";
    private String apiKey;
    private String secretKey;
    /**
     * Uygulama callback endpointi. Gönderilen request'teki callback boşsa bu kullanılır.
     */
    private String callbackUrl = "http://localhost:8080/api/payments/iyzico/callback";
    /**
     * Ödeme formu dili (TR/EN).
     */
    private String locale = "tr";
}

