package com.commerce.monorepo.controller;

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
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

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

    // Multipart upload — browser → backend → MinIO (CORS sorunu yok)
    @RateLimit(key = "asset:upload", limit = 20, windowSeconds = 60, perUser = true)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadImageRes upload(@RequestPart("file") MultipartFile file) throws Exception {
        String key = storageService.put(file.getContentType(), file.getInputStream(), file.getSize());
        String base = (publicUrl != null && !publicUrl.isBlank())
                ? publicUrl.stripTrailing()   // R2: https://pub-xxx.r2.dev/uploads/uuid
                : endpoint + "/" + bucket;    // MinIO: http://localhost:9000/commerce-assets
        String imageUrl = base + "/" + key;
        return new UploadImageRes(imageUrl, key);
    }

    public record UploadReq(String key, String contentType) {}
    public record UploadRes(String url, String method, Map<String, List<String>> headers, String key) {}

    // 🔥 Upload URL — ADMIN only (ürün görselleri yalnızca admin yükler)
    @RateLimit(key = "asset:upload", limit = 20, windowSeconds = 60, perUser = true)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PostMapping(
            path = "/upload-url",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public UploadRes createUploadUrl(@RequestBody UploadReq req) {
        String key = (req.key() != null && !req.key().isBlank())
                ? req.key()
                : "uploads/" + UUID.randomUUID();

        String ct = (req.contentType() != null && !req.contentType().isBlank())
                ? req.contentType()
                : "application/octet-stream";

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
