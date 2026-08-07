package com.commerce.monorepo.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ⭐ Custom BaseException => tüm domain hataları
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<?> handleBaseException(BaseException ex, HttpServletRequest request) {
        ErrorCode error = ex.getError();

        ErrorResponse body = ErrorResponse.builder()
                .code(error.getCode())
                .message(error.getMessage())
                .status(error.getStatus().value())
                .timestamp(Instant.now().toString())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(error.getStatus()).body(body);
    }

    // ⭐ Validation hataları
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {

        String msg = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(e -> e.getField() + " " + e.getDefaultMessage())
                .orElse("Validation error");

        ErrorResponse body = ErrorResponse.builder()
                .code(ErrorCode.VALIDATION_ERROR.getCode())
                .message(msg)
                .status(ErrorCode.VALIDATION_ERROR.getStatus().value())
                .timestamp(Instant.now().toString())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity
                .status(ErrorCode.VALIDATION_ERROR.getStatus())
                .body(body);
    }

    // ⭐ DB unique constraint ihlalleri — Excel içe aktarımda çakışan ürün adı/slug gibi durumlar
    // generic 500 yerine kullanıcının anlayabileceği bir mesaja çevrilir.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest request) {
        String rootMsg = ex.getMostSpecificCause().getMessage();
        ErrorCode error;
        // PostgreSQL formatı sabit: Detail: Key (kolon)=(değer) already exists.
        // Constraint adına değil, çakışan KOLONA göre eşleştiriyoruz — isimlendirme
        // migration'dan migration'a değişse de (elle verilen "uq_..." veya PG'nin
        // otomatik ürettiği "products_x_key") çalışmaya devam eder.
        if (rootMsg != null && (rootMsg.contains("Key (name)") || rootMsg.contains("uq_products_name"))) {
            error = ErrorCode.PRODUCT_NAME_ALREADY_EXISTS;
        } else if (rootMsg != null && rootMsg.contains("Key (slug)")) {
            error = ErrorCode.PRODUCT_SLUG_ALREADY_EXISTS;
        } else if (rootMsg != null && rootMsg.contains("Key (sku)")) {
            error = ErrorCode.MODEL_KODU_ALREADY_EXISTS;
        } else {
            log.error("Beklenmeyen veri bütünlüğü ihlali [{}] {}: {}", request.getMethod(), request.getRequestURI(), rootMsg, ex);
            error = ErrorCode.INTERNAL_ERROR;
        }

        ErrorResponse body = ErrorResponse.builder()
                .code(error.getCode())
                .message(error.getMessage())
                .status(error.getStatus().value())
                .timestamp(Instant.now().toString())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(error.getStatus()).body(body);
    }

    // ⭐ Fallback (yakalanmayan tüm hatalar)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception [{}] {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse body = ErrorResponse.builder()
                .code(ErrorCode.INTERNAL_ERROR.getCode())
                .message(ErrorCode.INTERNAL_ERROR.getMessage())
                .status(ErrorCode.INTERNAL_ERROR.getStatus().value())
                .timestamp(Instant.now().toString())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity
                .status(ErrorCode.INTERNAL_ERROR.getStatus())
                .body(body);
    }
}
