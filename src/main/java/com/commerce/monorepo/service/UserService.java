package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.CreateUserRequest;
import com.commerce.monorepo.dto.UserDto;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.entity.UserRole;
import com.commerce.monorepo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.util.List;
import java.util.NoSuchElementException;
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
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + id));
        return toDto(user);
    }
    
    @Transactional
    public UserDto create(CreateUserRequest request) {
        // Email uniqueness kontrolü
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists: " + request.email());
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
    
    private UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getCreatedAt() != null ? user.getCreatedAt().atOffset(ZoneOffset.UTC) : null
        );
    }
}

