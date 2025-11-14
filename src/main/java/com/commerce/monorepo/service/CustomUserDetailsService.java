package com.commerce.monorepo.service;

import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.UserRepository;
import com.commerce.monorepo.security.CustomUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        return new CustomUserPrincipal(user);
    }
}
