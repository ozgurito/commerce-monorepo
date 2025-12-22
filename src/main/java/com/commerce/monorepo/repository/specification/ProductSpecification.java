package com.commerce.monorepo.repository.specification;

import com.commerce.monorepo.dto.ProductSearchRequest;
import com.commerce.monorepo.entity.Product;
import com.commerce.monorepo.entity.ProductVariant;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> buildSpecification(ProductSearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Sadece aktif ürünler
            predicates.add(criteriaBuilder.isTrue(root.get("isActive")));

            // Keyword arama (name, description)
            if (StringUtils.hasText(request.getKeyword())) {
                String keyword = "%" + request.getKeyword().toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")), keyword);
                Predicate descPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")), keyword);
                predicates.add(criteriaBuilder.or(namePredicate, descPredicate));
            }

            // Kategori filtresi
            if (request.getCategoryId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), request.getCategoryId()));
            }
            
            // Çoklu kategori filtresi
            if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
                predicates.add(root.get("category").get("id").in(request.getCategoryIds()));
            }

            // Fiyat aralığı
            if (request.getMinPrice() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), request.getMinPrice()));
            }
            if (request.getMaxPrice() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), request.getMaxPrice()));
            }

            // Stokta olanlar
            if (Boolean.TRUE.equals(request.getInStockOnly())) {
                predicates.add(criteriaBuilder.greaterThan(root.get("stock"), 0));
            }

            // Öne çıkanlar
            if (Boolean.TRUE.equals(request.getFeaturedOnly())) {
                predicates.add(criteriaBuilder.isTrue(root.get("isFeatured")));
            }

            // Cinsiyet filtresi
            if (StringUtils.hasText(request.getGender())) {
                predicates.add(criteriaBuilder.equal(root.get("gender"), request.getGender()));
            }

            // Sezon filtresi
            if (StringUtils.hasText(request.getSeason())) {
                predicates.add(criteriaBuilder.equal(root.get("season"), request.getSeason()));
            }

            // Renk filtresi (Variants üzerinden)
            if (request.getColors() != null && !request.getColors().isEmpty()) {
                Subquery<Long> colorSubquery = query.subquery(Long.class);
                Root<ProductVariant> variantRoot = colorSubquery.from(ProductVariant.class);
                colorSubquery.select(variantRoot.get("product").get("id"))
                        .where(
                                criteriaBuilder.and(
                                        criteriaBuilder.equal(variantRoot.get("product").get("id"), root.get("id")),
                                        criteriaBuilder.lower(variantRoot.get("color")).in(
                                                request.getColors().stream().map(String::toLowerCase).toList()
                                        )
                                )
                        );

                predicates.add(criteriaBuilder.exists(colorSubquery));
            }

            // Beden filtresi (Variants üzerinden)
            if (request.getSizes() != null && !request.getSizes().isEmpty()) {
                Subquery<Long> sizeSubquery = query.subquery(Long.class);
                Root<ProductVariant> variantRoot = sizeSubquery.from(ProductVariant.class);
                sizeSubquery.select(variantRoot.get("product").get("id"))
                        .where(
                                criteriaBuilder.and(
                                        criteriaBuilder.equal(variantRoot.get("product").get("id"), root.get("id")),
                                        variantRoot.get("size").in(request.getSizes())
                                )
                        );

                predicates.add(criteriaBuilder.exists(sizeSubquery));
            }

            // Distinct (variant join'leri nedeniyle)
            query.distinct(true);

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

