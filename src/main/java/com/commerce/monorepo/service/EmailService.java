package com.commerce.monorepo.service;

import com.commerce.monorepo.config.AppProperties;
import com.commerce.monorepo.config.EmailProperties;
import com.commerce.monorepo.entity.Order;
import com.commerce.monorepo.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailProperties emailProperties;
    private final AppProperties appProperties;

    private static final NumberFormat CURRENCY_FORMAT = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("tr-TR"));
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    /**
     * Email doğrulama linki gönderir
     */
    @Async
    public void sendEmailVerificationEmail(User user, String token) {
        try {
            String verifyUrl = appProperties.getFrontendUrl() + "/email-dogrula?token=" + token;

            Context context = new Context();
            context.setVariable("userName", user.getFullName() != null ? user.getFullName() : user.getEmail());
            context.setVariable("verifyUrl", verifyUrl);
            context.setVariable("expiryHours", 24);

            String htmlContent = templateEngine.process("email/email-verification", context);

            log.info("Email verification token for {} — verify URL: {}", user.getEmail(), verifyUrl);

            sendHtmlEmail(
                user.getEmail(),
                "E-posta Adresinizi Doğrulayın",
                htmlContent
            );
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Şifre sıfırlama emaili gönderir
     */
    @Async
    public void sendPasswordResetEmail(User user, String token) {
        try {
            String resetUrl = appProperties.getFrontendUrl() + "/sifre-sifirla?token=" + token;
            
            Context context = new Context();
            context.setVariable("userName", user.getFullName() != null ? user.getFullName() : user.getEmail());
            context.setVariable("resetUrl", resetUrl);
            context.setVariable("expiryHours", 24);
            
            String htmlContent = templateEngine.process("email/password-reset", context);
            
            sendHtmlEmail(
                user.getEmail(),
                "Şifre Sıfırlama Talebi",
                htmlContent
            );
            
            log.info("Password reset email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Sipariş onay emaili gönderir
     */
    @Async
    public void sendOrderConfirmationEmail(Order order) {
        try {
            User user = order.getUser();
            
            Context context = new Context();
            context.setVariable("userName", user.getFullName() != null ? user.getFullName() : user.getEmail());
            context.setVariable("orderNumber", order.getOrderNumber());
            context.setVariable("orderDate", order.getCreatedAt().format(DATE_FORMAT));
            context.setVariable("items", order.getItems());
            context.setVariable("subtotal", formatCurrency(order.getSubtotal()));
            context.setVariable("tax", formatCurrency(order.getTax()));
            context.setVariable("shippingCost", formatCurrency(order.getShippingCost()));
            context.setVariable("total", formatCurrency(order.getTotal()));
            context.setVariable("shippingAddress", order.getShippingAddress());
            context.setVariable("orderUrl", appProperties.getFrontendUrl() + "/hesabim/siparislerim/" + order.getId());

            String htmlContent = templateEngine.process("email/order-confirmation", context);
            
            sendHtmlEmail(
                user.getEmail(),
                "Sipariş Onayı - #" + order.getOrderNumber(),
                htmlContent
            );
            
            log.info("Order confirmation email sent for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }

    /**
     * Ödeme başarılı emaili gönderir
     */
    @Async
    public void sendPaymentSuccessEmail(Order order) {
        try {
            User user = order.getUser();
            
            Context context = new Context();
            context.setVariable("userName", user.getFullName() != null ? user.getFullName() : user.getEmail());
            context.setVariable("orderNumber", order.getOrderNumber());
            context.setVariable("total", formatCurrency(order.getTotal()));
            context.setVariable("paymentId", order.getIyzicoPaymentId());
            context.setVariable("orderUrl", appProperties.getFrontendUrl() + "/hesabim/siparislerim/" + order.getId());

            String htmlContent = templateEngine.process("email/payment-success", context);
            
            sendHtmlEmail(
                user.getEmail(),
                "Ödeme Onayı - #" + order.getOrderNumber(),
                htmlContent
            );
            
            log.info("Payment success email sent for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to send payment success email for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }

    /**
     * Ödeme başarısız emaili gönderir
     */
    @Async
    public void sendPaymentFailedEmail(Order order, String reason) {
        try {
            User user = order.getUser();
            
            Context context = new Context();
            context.setVariable("userName", user.getFullName() != null ? user.getFullName() : user.getEmail());
            context.setVariable("orderNumber", order.getOrderNumber());
            context.setVariable("reason", reason != null ? reason : "Bilinmeyen hata");
            context.setVariable("retryUrl", appProperties.getFrontendUrl() + "/hesabim/siparislerim/" + order.getId());
            
            String htmlContent = templateEngine.process("email/payment-failed", context);
            
            sendHtmlEmail(
                user.getEmail(),
                "Ödeme Başarısız - #" + order.getOrderNumber(),
                htmlContent
            );
            
            log.info("Payment failed email sent for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to send payment failed email for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }

    /**
     * Sipariş durumu değişikliği emaili
     */
    @Async
    public void sendOrderStatusUpdateEmail(Order order) {
        try {
            User user = order.getUser();
            
            Context context = new Context();
            context.setVariable("userName", user.getFullName() != null ? user.getFullName() : user.getEmail());
            context.setVariable("orderNumber", order.getOrderNumber());
            context.setVariable("status", getStatusText(order.getStatus().name()));
            context.setVariable("orderUrl", appProperties.getFrontendUrl() + "/hesabim/siparislerim/" + order.getId());

            String htmlContent = templateEngine.process("email/order-status-update", context);
            
            sendHtmlEmail(
                user.getEmail(),
                "Sipariş Durumu Güncellendi - #" + order.getOrderNumber(),
                htmlContent
            );
            
            log.info("Order status update email sent for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to send order status update email for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }

    /**
     * Hoş geldin emaili (yeni kayıt)
     */
    @Async
    public void sendWelcomeEmail(User user) {
        try {
            Context context = new Context();
            context.setVariable("userName", user.getFullName() != null ? user.getFullName() : user.getEmail());
            context.setVariable("loginUrl", appProperties.getFrontendUrl() + "/giris");
            context.setVariable("shopUrl", appProperties.getFrontendUrl() + "/urunler");
            
            String htmlContent = templateEngine.process("email/welcome", context);
            
            sendHtmlEmail(
                user.getEmail(),
                "Hoş Geldiniz!",
                htmlContent
            );
            
            log.info("Welcome email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Düşük stok uyarısı (Admin'e)
     */
    @Async
    public void sendLowStockAlertEmail(String adminEmail, String productName, int currentStock, int threshold) {
        try {
            Context context = new Context();
            context.setVariable("productName", productName);
            context.setVariable("currentStock", currentStock);
            context.setVariable("threshold", threshold);
            context.setVariable("adminUrl", appProperties.getFrontendUrl() + "/admin/urunler");
            
            String htmlContent = templateEngine.process("email/low-stock-alert", context);
            
            sendHtmlEmail(
                adminEmail,
                "⚠️ Düşük Stok Uyarısı: " + productName,
                htmlContent
            );
            
            log.info("Low stock alert sent for product: {}", productName);
        } catch (Exception e) {
            log.error("Failed to send low stock alert for product {}: {}", productName, e.getMessage());
        }
    }

    // ========== HELPER METHODS ==========

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                message, 
                MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                "UTF-8"
            );
            
            String from = emailProperties.getFrom() != null ? emailProperties.getFrom() : "noreply@yourstore.com";
            String fromName = emailProperties.getFromName() != null ? emailProperties.getFromName() : "Your Store";
            
            helper.setFrom(from, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (java.io.UnsupportedEncodingException e) {
            throw new MessagingException("Failed to encode email", e);
        }
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "₺0,00";
        return CURRENCY_FORMAT.format(amount);
    }

    private String getStatusText(String status) {
        return switch (status) {
            case "PENDING" -> "Beklemede";
            case "PAID" -> "Ödeme Alındı";
            case "PROCESSING" -> "Hazırlanıyor";
            case "SHIPPED" -> "Kargoya Verildi";
            case "DELIVERED" -> "Teslim Edildi";
            case "CANCELLED" -> "İptal Edildi";
            case "REFUNDED" -> "İade Edildi";
            default -> status;
        };
    }
}

