package com.commerce.monorepo.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductDto {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("slug")
    private String slug;

    @JsonProperty("description")
    private String description;

    @JsonProperty("price")
    private BigDecimal price;

    @JsonProperty("comparePrice")
    private BigDecimal comparePrice;

    @JsonProperty("taxRate")
    private BigDecimal taxRate;

    @JsonProperty("stock")
    private Integer stock;

    @JsonProperty("sku")
    private String sku;

    @JsonProperty("active")
    private Boolean active;

    @JsonProperty("featured")
    private Boolean featured;

    @JsonProperty("flashDeal")
    private Boolean flashDeal;

    @JsonProperty("flashDealEndsAt")
    private java.time.Instant flashDealEndsAt;

    @JsonProperty("categoryId")
    private Long categoryId;

    @JsonProperty("categoryName")
    private String categoryName;

    @JsonProperty("imageUrl")
    private String imageUrl;

    @JsonProperty("averageRating")
    private Double averageRating;

    @JsonProperty("totalReviews")
    private Integer totalReviews;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @JsonProperty("fitType")
    private String fitType;

    @JsonProperty("fabricComposition")
    private String fabricComposition;

    @JsonProperty("careInstructions")
    private String careInstructions;

    @JsonProperty("modelInfo")
    private String modelInfo;

    @JsonProperty("sizeGuide")
    private String sizeGuide;

    @JsonProperty("material")
    private String material;

    @JsonProperty("season")
    private String season;

    @JsonProperty("originCountry")
    private String originCountry;

    @JsonProperty("gender")
    private String gender;

    @JsonProperty("ageGroup")
    private String ageGroup;

    @JsonProperty("specifications")
    private String specifications;

    /** Sadece renge göre açılmış liste satırlarında dolu — hangi renge ait bu kart */
    @JsonProperty("variantColor")
    private String variantColor;

    @JsonProperty("variantColorHex")
    private String variantColorHex;
}
