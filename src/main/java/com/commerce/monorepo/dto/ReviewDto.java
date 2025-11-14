package com.commerce.monorepo.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReviewDto {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("productId")
    private Long productId;

    @JsonProperty("productName")
    private String productName;

    @JsonProperty("userId")
    private Long userId;

    @JsonProperty("userName")
    private String userName;

    @JsonProperty("rating")
    private Integer rating;

    @JsonProperty("title")
    private String title;

    @JsonProperty("comment")
    private String comment;

    @JsonProperty("images")
    private List<String> images;

    @JsonProperty("verifiedPurchase")
    private Boolean verifiedPurchase;

    @JsonProperty("approved")
    private Boolean approved;

    @JsonProperty("featured")
    private Boolean featured;

    @JsonProperty("helpfulCount")
    private Integer helpfulCount;

    @JsonProperty("unhelpfulCount")
    private Integer unhelpfulCount;

    @JsonProperty("adminResponse")
    private String adminResponse;

    @JsonProperty("adminResponseAt")
    private LocalDateTime adminResponseAt;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}
