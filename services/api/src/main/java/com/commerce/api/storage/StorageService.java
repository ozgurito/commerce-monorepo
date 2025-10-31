package com.commerce.api.storage;

import java.io.InputStream;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class StorageService {

    private final S3Client s3;
    private final String bucket;

    public StorageService(S3Client s3, @Value("${storage.s3.bucket}") String bucket) {
        this.s3 = s3;
        this.bucket = bucket;
    }

    /** Sunucu tarafı upload (opsiyonel). */
    public String put(String contentType, InputStream stream, long size) {
        String key = "uploads/" + UUID.randomUUID();
        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(bucket).key(key).contentType(contentType).build();
        s3.putObject(put, RequestBody.fromInputStream(stream, size));
        return key;
    }
}
