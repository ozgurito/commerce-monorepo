package com.commerce.monorepo.controller;

import com.commerce.monorepo.config.AppProperties;
import com.commerce.monorepo.config.EmailProperties;
import com.commerce.monorepo.service.EmailService;
import com.commerce.monorepo.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test/email")
@RequiredArgsConstructor
@Tag(name = "Email Test", description = "Email test endpoint'leri (Sadece development için!)")
public class EmailTestController {

    private final EmailService emailService;
    private final EmailProperties emailProperties;
    private final AppProperties appProperties;
    
    @Value("${spring.mail.host:not-set}")
    private String mailHost;
    
    @Value("${spring.mail.port:not-set}")
    private String mailPort;
    
    @Value("${spring.mail.username:not-set}")
    private String mailUsername;

    @GetMapping("/config")
    @Operation(summary = "Email config kontrolü", description = "Email ayarlarını gösterir (şifre hariç)")
    public ResponseEntity<Map<String, Object>> getEmailConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("mailHost", mailHost);
        config.put("mailPort", mailPort);
        config.put("mailUsername", mailUsername);
        config.put("mailPasswordSet", mailUsername != null && !mailUsername.equals("not-set") && 
                   !mailUsername.equals("your-email@gmail.com"));
        config.put("appEmailFrom", emailProperties.getFrom());
        config.put("appEmailFromName", emailProperties.getFromName());
        config.put("frontendUrl", appProperties.getFrontendUrl());
        config.put("note", "Şifre güvenlik nedeniyle gösterilmiyor");
        return ResponseEntity.ok(config);
    }

    @PostMapping("/welcome")
    @Operation(summary = "Welcome email testi", description = "Belirtilen adrese hoş geldin emaili gönderir")
    public ResponseEntity<Map<String, String>> testWelcomeEmail(
            @RequestParam String toEmail,
            @RequestParam(defaultValue = "Test User") String userName) {
        
        // Geçici user objesi oluştur
        User testUser = new User();
        testUser.setEmail(toEmail);
        testUser.setFullName(userName);
        
        emailService.sendWelcomeEmail(testUser);
        
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "message", "Welcome email gönderildi: " + toEmail,
            "note", "Email async gönderilir, 5-10 saniye bekleyin"
        ));
    }

    @PostMapping("/password-reset")
    @Operation(summary = "Password reset email testi", description = "Şifre sıfırlama emaili gönderir")
    public ResponseEntity<Map<String, String>> testPasswordResetEmail(
            @RequestParam String toEmail,
            @RequestParam(defaultValue = "Test User") String userName) {
        
        User testUser = new User();
        testUser.setEmail(toEmail);
        testUser.setFullName(userName);
        
        String testToken = "test-token-" + System.currentTimeMillis();
        emailService.sendPasswordResetEmail(testUser, testToken);
        
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "message", "Password reset email gönderildi: " + toEmail,
            "testToken", testToken
        ));
    }

    @PostMapping("/low-stock")
    @Operation(summary = "Düşük stok uyarı emaili testi")
    public ResponseEntity<Map<String, String>> testLowStockEmail(
            @RequestParam String adminEmail,
            @RequestParam(defaultValue = "Test Ürün") String productName,
            @RequestParam(defaultValue = "3") int currentStock,
            @RequestParam(defaultValue = "10") int threshold) {
        
        emailService.sendLowStockAlertEmail(adminEmail, productName, currentStock, threshold);
        
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "message", "Low stock alert gönderildi: " + adminEmail
        ));
    }
}
