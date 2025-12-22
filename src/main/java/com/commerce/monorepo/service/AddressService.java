package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.UserAddressDto;
import com.commerce.monorepo.dto.UserAddressRequest;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.entity.UserAddress;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.UserAddressRepository;
import com.commerce.monorepo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressService {

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    private static final int MAX_ADDRESSES = 10;

    @Transactional(readOnly = true)
    public List<UserAddressDto> getMyAddresses() {
        User user = getCurrentUser();
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserAddressDto getAddress(Long addressId) {
        User user = getCurrentUser();
        UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
        return mapToDto(address);
    }

    public UserAddressDto createAddress(UserAddressRequest request) {
        User user = getCurrentUser();

        // Max adres kontrolü
        Long currentCount = addressRepository.countByUserId(user.getId());
        if (currentCount >= MAX_ADDRESSES) {
            throw new BaseException(ErrorCode.VALIDATION_ERROR);
        }

        // İlk adres ise default yap
        boolean isFirst = currentCount == 0;

        // Default yapılacaksa diğerlerini temizle (sadece ilk adres değilse)
        if (Boolean.TRUE.equals(request.getIsDefault()) && !isFirst) {
            addressRepository.clearDefaultAddressesByType(user.getId(), request.getAddressType());
        }

        UserAddress address = new UserAddress();
        address.setUser(user);
        address.setTitle(request.getTitle());
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setCity(request.getCity());
        address.setDistrict(request.getDistrict());
        address.setNeighborhood(request.getNeighborhood());
        address.setAddressLine(request.getAddressLine());
        address.setPostalCode(request.getPostalCode());
        // İlk adres ise her zaman default, değilse request'teki değeri kullan
        address.setIsDefault(isFirst || Boolean.TRUE.equals(request.getIsDefault()));
        address.setAddressType(request.getAddressType());

        UserAddress saved = addressRepository.save(address);
        return mapToDto(saved);
    }

    public UserAddressDto updateAddress(Long addressId, UserAddressRequest request) {
        User user = getCurrentUser();

        UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // Default yapılacaksa diğerlerini temizle
        if (Boolean.TRUE.equals(request.getIsDefault()) && !address.getIsDefault()) {
            addressRepository.clearDefaultAddressesByType(user.getId(), request.getAddressType());
        }

        address.setTitle(request.getTitle());
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setCity(request.getCity());
        address.setDistrict(request.getDistrict());
        address.setNeighborhood(request.getNeighborhood());
        address.setAddressLine(request.getAddressLine());
        address.setPostalCode(request.getPostalCode());
        address.setIsDefault(request.getIsDefault());
        address.setAddressType(request.getAddressType());

        UserAddress saved = addressRepository.save(address);
        return mapToDto(saved);
    }

    public void deleteAddress(Long addressId) {
        User user = getCurrentUser();

        UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        addressRepository.delete(address);
    }

    public UserAddressDto setDefaultAddress(Long addressId) {
        User user = getCurrentUser();

        UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // Aynı tipteki diğer default'ları temizle
        addressRepository.clearDefaultAddressesByType(user.getId(), address.getAddressType());

        address.setIsDefault(true);
        UserAddress saved = addressRepository.save(address);
        return mapToDto(saved);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
    }

    private UserAddressDto mapToDto(UserAddress address) {
        return new UserAddressDto(
                address.getId(),
                address.getTitle(),
                address.getFullName(),
                address.getPhone(),
                address.getCity(),
                address.getDistrict(),
                address.getNeighborhood(),
                address.getAddressLine(),
                address.getPostalCode(),
                address.getIsDefault(),
                address.getAddressType(),
                address.getFormattedAddress()
        );
    }
}

