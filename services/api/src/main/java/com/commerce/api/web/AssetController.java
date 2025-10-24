// src/main/java/com/commerce/api/web/AssetController.java
package com.commerce.api.web;

import java.net.URL;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

@RestController
@RequestMapping("/assets")
public class AssetController {

    private final S3Presigner presigner;

    @Value("${storage.s3.bucket}")
    private String bucket;

    public AssetController(S3Presigner presigner) {
        this.presigner = presigner;
    }

    public record UploadReq(String key, String contentType) {}
    public record UploadRes(String url, String method, Map<String, List<String>> headers, String key) {}

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