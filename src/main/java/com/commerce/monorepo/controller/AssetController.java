package com.commerce.monorepo.controller;

import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.ratelimit.RateLimit;
import com.commerce.monorepo.storage.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.net.URL;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_SIZE = 5L * 1024 * 1024; // 5MB

    private final S3Presigner presigner;
    private final StorageService storageService;

    @Value("${storage.s3.bucket}")
    private String bucket;

    @Value("${storage.s3.endpoint}")
    private String endpoint;

    /** Cloudflare R2 public CDN URL. Set: S3_PUBLIC_URL env var.
     *  If empty, falls back to endpoint/bucket/key (MinIO/local). */
    @Value("${storage.s3.public-url:}")
    private String publicUrl;

    public AssetController(S3Presigner presigner, StorageService storageService) {
        this.presigner = presigner;
        this.storageService = storageService;
    }

    public record UploadImageRes(String imageUrl, String key) {}

    /** URL sonundaki '/' karakterlerini temizler. stripTrailing() YALNIZCA whitespace temizler — burada KULLANILMAZ. */
    private String trimTrailingSlash(String value) {
        if (value == null) return null;
        return value.replaceAll("/+$", "");
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new BaseException(ErrorCode.INVALID_FILE_TYPE);
        };
    }

    /** Tarih bazlı, UUID tabanlı güvenli storage key üretir: uploads/yyyy/MM/uuid.ext (orijinal dosya adı kullanılmaz). */
    private String safeKey(String contentType) {
        LocalDate now = LocalDate.now(ZoneId.of("Europe/Istanbul"));
        return "uploads/%d/%02d/%s%s".formatted(
                now.getYear(), now.getMonthValue(),
                UUID.randomUUID(), extensionFor(contentType)
        );
    }

    // Multipart upload — browser → backend → MinIO/R2 (CORS sorunu yok)
    @RateLimit(key = "asset:upload", limit = 20, windowSeconds = 60, perUser = true)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadImageRes upload(@RequestPart("file") MultipartFile file) throws Exception {
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_TYPES.contains(ct)) {
            throw new BaseException(ErrorCode.INVALID_FILE_TYPE);
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BaseException(ErrorCode.FILE_TOO_LARGE);
        }

        String key = safeKey(ct);
        storageService.putWithKey(key, ct, file.getInputStream(), file.getSize());
        String base = (publicUrl != null && !publicUrl.isBlank())
                ? trimTrailingSlash(publicUrl)          // R2: https://cdn.alisverisnoktan.com
                : trimTrailingSlash(endpoint) + "/" + bucket; // MinIO: http://localhost:9000/commerce-assets
        String imageUrl = base + "/" + key;
        return new UploadImageRes(imageUrl, key);
    }

    // key alanı geriye dönük frontend uyumluluğu için modelde kalır; backend bunu YOK SAYAR (bkz. createUploadUrl).
    public record UploadReq(String key, String contentType) {}
    public record UploadRes(String url, String method, Map<String, List<String>> headers, String key) {}

    // 🔥 Upload URL — ADMIN only (ürün görselleri yalnızca admin yükler)
    // NOT: Presigned PUT akışında dosya backend'den geçmeden doğrudan R2/S3'e yazılır; bu yüzden burada
    // dosya boyutu (5MB) backend tarafından KESİN ENFORCE EDİLEMEZ — content-type whitelist + safe key uygulanır.
    // Gerçek boyut sınırı için ileride presigned POST + content-length-range policy ya da admin upload'ın
    // tamamen /upload (multipart, backend kontrollü) akışına taşınması gerekir. (Teknik borç)
    @RateLimit(key = "asset:upload", limit = 20, windowSeconds = 60, perUser = true)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PostMapping(
            path = "/upload-url",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public UploadRes createUploadUrl(@RequestBody UploadReq req) {
        String ct = req.contentType();
        if (ct == null || !ALLOWED_TYPES.contains(ct)) {
            throw new BaseException(ErrorCode.INVALID_FILE_TYPE);
        }

        // req.key() KESİNLİKLE kullanılmaz — key her zaman backend tarafından safeKey(contentType) ile üretilir.
        String key = safeKey(ct);

        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(ct)
                .build();

        PresignedPutObjectRequest pre = presigner.presignPutObject(b -> b
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(put));

        URL url = pre.url();
        return new UploadRes(url.toString(), "PUT", pre.signedHeaders(), key);
    }

    public record DownloadReq(String key) {}
    public record DownloadRes(String url, String key) {}

    // 🔥 Download URL — authenticated user (okuma herkese açık)
    @RateLimit(key = "asset:download", limit = 30, windowSeconds = 60, perUser = true)
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    @PostMapping(
            path = "/download-url",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public DownloadRes createDownloadUrl(@RequestBody DownloadReq req) {

        GetObjectRequest get = GetObjectRequest.builder()
                .bucket(bucket)
                .key(req.key())
                .build();

        PresignedGetObjectRequest pre = presigner.presignGetObject(b -> b
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(get));

        return new DownloadRes(pre.url().toString(), req.key());
    }
}
