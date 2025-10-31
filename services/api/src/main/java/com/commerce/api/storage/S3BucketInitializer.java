// src/main/java/com/commerce/api/storage/S3BucketInitializer.java
package com.commerce.api.storage;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

@Component
public class S3BucketInitializer {

    private final S3Client s3;
    private final String bucket;

    public S3BucketInitializer(S3Client s3, @Value("${storage.s3.bucket}") String bucket) {
        this.s3 = s3;
        this.bucket = bucket;
    }

    @PostConstruct
    public void ensureBucket() {
        try {
            if (!s3.listBuckets().buckets().stream().anyMatch(b -> b.name().equals(bucket))) {
                s3.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            }
        } catch (S3Exception e) {
            // bucket zaten varsa veya yetki yoksa sessiz geç
        }
    }
}
