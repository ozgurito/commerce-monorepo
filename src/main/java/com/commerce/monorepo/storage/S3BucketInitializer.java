// src/main/java/com/commerce/api/storage/S3BucketInitializer.java
package com.commerce.monorepo.storage;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

@Component
public class S3BucketInitializer {

    private static final Logger log = LoggerFactory.getLogger(S3BucketInitializer.class);

    private final S3Client s3;
    private final String bucket;

    public S3BucketInitializer(S3Client s3, @Value("${storage.s3.bucket}") String bucket) {
        this.s3 = s3;
        this.bucket = bucket;
    }

    @PostConstruct
    public void ensureBucket() {
        try {
            boolean exists = s3.listBuckets().buckets().stream().anyMatch(b -> b.name().equals(bucket));
            if (!exists) {
                s3.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
                log.info("S3 bucket created: {}", bucket);
            }
        } catch (S3Exception e) {
            log.warn("Could not create bucket {}: {}", bucket, e.getMessage());
        }

        // Public read policy — ayrı try/catch, bucket oluşturma hatasından bağımsız
        try {
            String policy = """
                {
                  "Version": "2012-10-17",
                  "Statement": [{
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": "arn:aws:s3:::%s/*"
                  }]
                }
                """.formatted(bucket);
            s3.putBucketPolicy(PutBucketPolicyRequest.builder()
                    .bucket(bucket)
                    .policy(policy)
                    .build());
            log.info("Public read policy set on bucket: {}", bucket);
        } catch (S3Exception e) {
            log.error("Could not set public policy on bucket {}: {}", bucket, e.getMessage());
        }

        // CORS — tarayıcıdan presigned PUT yapılabilmesi için (localhost:3000 → localhost:9000)
        try {
            s3.putBucketCors(PutBucketCorsRequest.builder()
                    .bucket(bucket)
                    .corsConfiguration(CORSConfiguration.builder()
                            .corsRules(CORSRule.builder()
                                    .allowedOrigins("*")
                                    .allowedMethods("GET", "PUT", "POST", "DELETE", "HEAD")
                                    .allowedHeaders("*")
                                    .exposeHeaders("ETag")
                                    .maxAgeSeconds(3600)
                                    .build())
                            .build())
                    .build());
            log.info("CORS configured on bucket: {}", bucket);
        } catch (S3Exception e) {
            log.error("Could not set CORS on bucket {}: {}", bucket, e.getMessage());
        }
    }
}
