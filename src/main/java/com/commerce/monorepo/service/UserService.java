package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.ChangePasswordRequest;
import com.commerce.monorepo.dto.CreateUserRequest;
import com.commerce.monorepo.dto.UpdateProfileRequest;
import com.commerce.monorepo.dto.UserDto;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.entity.UserRole;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserDto> findAll() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
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
        return toDto(saved);
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

        if (request.identityNumber() != null && !request.identityNumber().isBlank()) {
            user.setIdentityNumber(request.identityNumber());
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
                user.getIdentityNumber(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getCreatedAt() != null ? user.getCreatedAt().atOffset(ZoneOffset.UTC) : null
        );
    }
}
