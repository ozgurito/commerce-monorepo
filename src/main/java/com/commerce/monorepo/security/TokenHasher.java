package com.commerce.monorepo.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Component
public class TokenHasher {

    @Value("${refresh.pepper}")
    private String pepper;

    public String hmacSHA256Hex(String rawToken) {
        try{
            Mac mac= Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(pepper.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(key);
            byte[] digest = mac.doFinal(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Token hashing failed", e);
        }
    }

    // raw refresh token ile hashlenmiş olanı karşılaştırma
    public boolean matches(String rawToken, String expectedHash){
        String rawHash=hmacSHA256Hex(rawToken);
        return rawHash.equals(expectedHash);
    }

}
