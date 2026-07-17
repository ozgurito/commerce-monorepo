package com.commerce.monorepo.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // AUTH
    INVALID_CREDENTIALS("1001", "Kullanıcı adı veya şifre hatalı", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED("1002", "Yetkilendirme gerekli", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED("1003", "Bu işlemi yapmaya yetkiniz yok", HttpStatus.FORBIDDEN),
    ACCOUNT_DISABLED("1014", "Hesabınız askıya alınmıştır. Destek ile iletişime geçin.", HttpStatus.FORBIDDEN),
    ACCOUNT_LOCKED("1015", "Çok fazla hatalı giriş denemesi. Hesabınız geçici olarak kilitlendi. Lütfen 15 dakika sonra tekrar deneyin.", HttpStatus.FORBIDDEN),
    EMAIL_NOT_VERIFIED("1016", "E-posta adresinizi doğrulamanız gerekiyor. Lütfen e-posta kutunuzu kontrol edin.", HttpStatus.FORBIDDEN),
    VERIFICATION_TOKEN_INVALID("1017", "Geçersiz doğrulama bağlantısı", HttpStatus.BAD_REQUEST),
    VERIFICATION_TOKEN_EXPIRED("1018", "Doğrulama bağlantısının süresi dolmuş. Yeni bir bağlantı talep edin.", HttpStatus.BAD_REQUEST),
    VERIFICATION_TOKEN_USED("1019", "Bu doğrulama bağlantısı zaten kullanılmış", HttpStatus.BAD_REQUEST),

    EMAIL_TAKEN("1004", "Bu e-posta zaten kayıtlı", HttpStatus.CONFLICT),
    FULL_NAME_TAKEN("1005", "Bu kullanıcı adı zaten kullanımda", HttpStatus.CONFLICT),
    USER_NOT_FOUND("1006", "Kullanıcı bulunamadı", HttpStatus.NOT_FOUND),
    PASSWORD_MISMATCH("1007", "Şifreler eşleşmiyor", HttpStatus.BAD_REQUEST),
    INVALID_CURRENT_PASSWORD("1008", "Mevcut şifre hatalı", HttpStatus.BAD_REQUEST),
    SAME_PASSWORD("1009", "Yeni şifre mevcut şifreden farklı olmalı", HttpStatus.BAD_REQUEST),
    PROFILE_UPDATE_EMPTY("1010", "En az bir alan güncellenmelidir", HttpStatus.BAD_REQUEST),

    // PASSWORD RESET
    RESET_TOKEN_INVALID("1011", "Geçersiz şifre sıfırlama linki", HttpStatus.BAD_REQUEST),
    RESET_TOKEN_EXPIRED("1012", "Şifre sıfırlama linki süresi dolmuş", HttpStatus.BAD_REQUEST),
    RESET_TOKEN_USED("1013", "Bu şifre sıfırlama linki zaten kullanılmış", HttpStatus.BAD_REQUEST),

    // REFRESH TOKEN
    INVALID_REFRESH_TOKEN("2001", "Refresh token geçersiz", HttpStatus.UNAUTHORIZED),
    EXPIRED_REFRESH_TOKEN("2002", "Refresh token süresi dolmuş", HttpStatus.UNAUTHORIZED),
    REVOKED_REFRESH_TOKEN("2003", "Refresh token iptal edilmiş", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_COMPROMISED("2004", "Şüpheli refresh token kullanımı tespit edildi", HttpStatus.UNAUTHORIZED),

    INVALID_REFRESH_FORMAT("2005", "Refresh token formatı geçersiz", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_PREFIX("2006", "Refresh token prefix bulunamadı", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_SIGNATURE("2007", "Refresh token imza doğrulaması başarısız", HttpStatus.UNAUTHORIZED),
    REFRESH_REUSE_DETECTED("2008", "Refresh token reuse tespit edildi", HttpStatus.UNAUTHORIZED),
    MISSING_REFRESH_TOKEN("2009", "Refresh token eksik", HttpStatus.UNAUTHORIZED),


    // RATE LIMIT
    TOO_MANY_REQUESTS("3001", "Çok fazla istek gönderildi", HttpStatus.TOO_MANY_REQUESTS),


    // VALIDATION (4000)
    VALIDATION_ERROR("4000", "Geçersiz veya eksik parametre", HttpStatus.BAD_REQUEST),
    USER_EMAIL_TAKEN("4001", "Bu email zaten kullanımda", HttpStatus.CONFLICT),
    PRODUCT_OUT_OF_STOCK("4008", "Ürün stokta yok", HttpStatus.BAD_REQUEST),
    VARIANT_NOT_FOUND("4009", "Ürün varyantı bulunamadı", HttpStatus.NOT_FOUND),
    VARIANT_REQUIRED("4010", "Bu ürün için renk/beden seçimi zorunludur", HttpStatus.BAD_REQUEST),
    INVALID_FILE_TYPE("4011", "Sadece JPEG, PNG veya WEBP görseller yüklenebilir.", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE("4012", "Görsel en fazla 5MB olabilir.", HttpStatus.BAD_REQUEST),

    // DOMAIN / BUSINESS ERRORS (5000)

    // PRODUCT
    PRODUCT_NOT_FOUND("5001", "Ürün bulunamadı", HttpStatus.NOT_FOUND),
    PRODUCT_IMAGE_NOT_FOUND("5001A", "Ürün resmi bulunamadı", HttpStatus.NOT_FOUND),
    MODEL_KODU_ALREADY_EXISTS("5002", "Bu Model Kodu zaten kullanımda", HttpStatus.CONFLICT),
    VARIANT_BARKOD_ALREADY_EXISTS("5002A", "Bu Barkod zaten kullanımda", HttpStatus.CONFLICT),
    INSUFFICIENT_STOCK("5003", "Yetersiz stok", HttpStatus.BAD_REQUEST),

    // CART
    CART_ITEM_NOT_FOUND("5004", "Sepet ürünü bulunamadı", HttpStatus.NOT_FOUND),
    CART_NOT_FOUND("5004A", "Sepet bulunamadı", HttpStatus.NOT_FOUND),

    // CATEGORY
    CATEGORY_NOT_FOUND("5005", "Kategori bulunamadı", HttpStatus.NOT_FOUND),
    CATEGORY_SLUG_TAKEN("5006", "Kategori slug zaten mevcut", HttpStatus.CONFLICT),
    PARENT_CATEGORY_NOT_FOUND("5007", "Üst kategori bulunamadı", HttpStatus.NOT_FOUND),

    // CUSTOM DESIGN
    BASE_PRODUCT_NOT_FOUND("5008", "Base ürün bulunamadı", HttpStatus.NOT_FOUND),
    CUSTOM_DESIGN_NOT_FOUND("5009", "Tasarım bulunamadı", HttpStatus.NOT_FOUND),
    DESIGN_ACCESS_DENIED("5010", "Bu tasarıma erişim izniniz yok", HttpStatus.FORBIDDEN),
    DESIGN_ALREADY_SUBMITTED("5011", "Tasarım zaten gönderilmiş", HttpStatus.BAD_REQUEST),
    DESIGN_INVALID_STATE("5012", "Bu durumdaki tasarım için işlem yapılamaz", HttpStatus.BAD_REQUEST),

    // CREDITS
    INSUFFICIENT_CREDITS("5013", "Yetersiz kredi", HttpStatus.BAD_REQUEST),

    // ORDER
    ORDER_NOT_FOUND("5014", "Sipariş bulunamadı", HttpStatus.NOT_FOUND),
    ORDER_FORBIDDEN("5015", "Bu sipariş size ait değil", HttpStatus.FORBIDDEN),
    ORDER_INVALID_STATUS("5016", "Geçersiz sipariş durumu", HttpStatus.BAD_REQUEST),
    ORDER_NOT_CANCELABLE("5017", "Bu sipariş iptal edilemez", HttpStatus.BAD_REQUEST),
    ORDER_CREATION_FAILED("5018", "Sipariş oluşturulamadı", HttpStatus.CONFLICT),
    PAYMENT_INIT_FAILED("5019", "Ödeme başlatılamadı", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_PROCESSED("5020", "Ödeme zaten işlendi", HttpStatus.BAD_REQUEST),
    PAYMENT_CALLBACK_INVALID("5021", "Ödeme doğrulama hatası", HttpStatus.BAD_REQUEST),

    // REVIEW
    REVIEWS_NOT_ALLOWED("5022", "Bu ürün için yorumlara izin verilmiyor", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_FOUND("5023", "Yorum bulunamadı", HttpStatus.NOT_FOUND),
    REVIEW_SELF_HELPFUL_FORBIDDEN("5024", "Kendi yorumunu helpful olarak işaretleyemezsin", HttpStatus.BAD_REQUEST),
    REVIEW_SELF_VOTE_FORBIDDEN("5025", "Kendi yorumunu oylayamazsın", HttpStatus.FORBIDDEN),
    PRODUCT_REVIEWS_DISABLED("5026", "Bu ürün için yorumlar kapalı", HttpStatus.BAD_REQUEST),

    // COUPON
    COUPON_NOT_FOUND("5027", "Kupon bulunamadı", HttpStatus.NOT_FOUND),
    COUPON_CODE_EXISTS("5028", "Bu kupon kodu zaten mevcut", HttpStatus.CONFLICT),
    COUPON_EXPIRED("5029", "Kuponun süresi dolmuş", HttpStatus.BAD_REQUEST),
    COUPON_INVALID("5030", "Kupon geçersiz", HttpStatus.BAD_REQUEST),
    COUPON_USAGE_LIMIT_REACHED("5031", "Kupon kullanım limiti dolmuş", HttpStatus.BAD_REQUEST),
    COUPON_USER_LIMIT_REACHED("5032", "Bu kuponu daha fazla kullanamazsınız", HttpStatus.BAD_REQUEST),
    COUPON_MINIMUM_NOT_MET("5033", "Minimum sipariş tutarına ulaşılmadı", HttpStatus.BAD_REQUEST),
    COUPON_FIRST_ORDER_ONLY("5034", "Bu kupon sadece ilk sipariş için geçerli", HttpStatus.BAD_REQUEST),
    COUPON_NOT_APPLICABLE("5035", "Bu kupon seçili ürünlere uygulanamaz", HttpStatus.BAD_REQUEST),

    // SERVER (9000)
    INTERNAL_ERROR("9001", "Sunucu hatası oluştu", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus status;

    ErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}
