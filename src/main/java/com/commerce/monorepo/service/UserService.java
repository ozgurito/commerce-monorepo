package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.ChangePasswordRequest;
import com.commerce.monorepo.dto.CreateUserRequest;
import com.commerce.monorepo.dto.UpdateProfileRequest;
import com.commerce.monorepo.dto.UserDto;
import com.commerce.monorepo.entity.Coupon;
import com.commerce.monorepo.entity.DiscountType;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.entity.UserRole;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.CouponRepository;
import com.commerce.monorepo.repository.OrderRepository;
import com.commerce.monorepo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;

    static final String WELCOME_COUPON_CODE = "WELCOME10";

    @Transactional(readOnly = true)
    public List<UserDto> findAll() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<UserDto> findAllPaged(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDto);
    }

    /** Admin: hesabı aktif / pasif yap */
    @Transactional
    public UserDto toggleActive(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        return toDto(userRepository.save(user));
    }

    /** Admin: rol değiştir */
    @Transactional
    public UserDto changeRole(Long id, String roleName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
        try {
            user.setRole(UserRole.valueOf(roleName.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BaseException(ErrorCode.VALIDATION_ERROR);
        }
        return toDto(userRepository.save(user));
    }

    /** Admin: brute-force kilidini manuel aç */
    @Transactional
    public UserDto unlockAccount(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
        user.setLockedUntil(null);
        user.setFailedLoginAttempts(0);
        return toDto(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserDto findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        return toDto(user);
    }

    @Transactional
    public UserDto create(CreateUserRequest request) {

        // Email eşsizliği
        if (userRepository.existsByEmail(request.email())) {
            throw new BaseException(ErrorCode.USER_EMAIL_TAKEN);
        }

        // User entity oluştur
        User user = new User();
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(UserRole.USER);

        User saved = userRepository.save(user);

        // Yeni üye → WELCOME10 kuponu yoksa oluştur (idempotent)
        ensureWelcomeCouponExists();

        return toDto(saved);
    }

    /** WELCOME10 kuponu DB'de yoksa oluşturur — race condition'a karşı try/catch */
    private void ensureWelcomeCouponExists() {
        if (couponRepository.existsByCode(WELCOME_COUPON_CODE)) return;
        try {
            Coupon coupon = new Coupon();
            coupon.setCode(WELCOME_COUPON_CODE);
            coupon.setDescription("Hoş Geldiniz! İlk siparişinize özel %10 indirim");
            coupon.setDiscountType(DiscountType.PERCENTAGE);
            coupon.setDiscountValue(new BigDecimal("10"));
            coupon.setFirstOrderOnly(true);
            coupon.setUsageLimitPerUser(1);
            coupon.setIsActive(true);
            couponRepository.save(coupon);
        } catch (Exception ignored) {
            // Eşzamanlı kayıt durumunda unique constraint hatası — görmezden gel
        }
    }

    /**
     * Kullanıcının WELCOME10 için uygunluğunu kontrol eder.
     * Koşul: hiç siparişi olmamalı + kupon aktif olmalı
     */
    @Transactional
    public Map<String, Object> getWelcomeCouponEligibility(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // Kupon yoksa burada da oluştur (mevcut kullanıcılar için güvence)
        ensureWelcomeCouponExists();

        long orderCount = orderRepository.countByUserId(user.getId());
        boolean couponActive = couponRepository.findByCodeAndIsActiveTrue(WELCOME_COUPON_CODE).isPresent();
        boolean eligible = orderCount == 0 && couponActive;

        return Map.of(
                "eligible", eligible,
                "code", WELCOME_COUPON_CODE,
                "discountPercent", 10
        );
    }

    @Transactional(readOnly = true)
    public UserDto findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
        return toDto(user);
    }

    @Transactional
    public UserDto updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        boolean updated = false;

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
            updated = true;
        }
        
        if (request.phone() != null) {
            user.setPhone(request.phone().trim());
            updated = true;
        }

        if (!updated) {
            throw new BaseException(ErrorCode.PROFILE_UPDATE_EMPTY);
        }

        User saved = userRepository.save(user);
        return toDto(saved);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BaseException(ErrorCode.INVALID_CURRENT_PASSWORD);
        }

        if (!request.passwordsMatch()) {
            throw new BaseException(ErrorCode.PASSWORD_MISMATCH);
        }

        if (!request.isNewPasswordDifferent()) {
            throw new BaseException(ErrorCode.SAME_PASSWORD);
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getIsActive(),
                user.getEmailVerified(),
                user.getLastLoginAt() != null ? user.getLastLoginAt().atOffset(ZoneOffset.UTC) : null,
                user.getCreatedAt() != null ? user.getCreatedAt().atOffset(ZoneOffset.UTC) : null
        );
    }
}
