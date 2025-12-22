package com.commerce.monorepo.controller;

import com.commerce.monorepo.dto.UserAddressDto;
import com.commerce.monorepo.dto.UserAddressRequest;
import com.commerce.monorepo.ratelimit.RateLimit;
import com.commerce.monorepo.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @RateLimit(key = "address:list", limit = 30, windowSeconds = 60)
    public List<UserAddressDto> getMyAddresses() {
        return addressService.getMyAddresses();
    }

    @GetMapping("/{id}")
    @RateLimit(key = "address:get", limit = 30, windowSeconds = 60)
    public UserAddressDto getAddress(@PathVariable Long id) {
        return addressService.getAddress(id);
    }

    @PostMapping
    @RateLimit(key = "address:create", limit = 10, windowSeconds = 60)
    @ResponseStatus(HttpStatus.CREATED)
    public UserAddressDto createAddress(@Valid @RequestBody UserAddressRequest request) {
        return addressService.createAddress(request);
    }

    @PutMapping("/{id}")
    @RateLimit(key = "address:update", limit = 10, windowSeconds = 60)
    public UserAddressDto updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody UserAddressRequest request) {
        return addressService.updateAddress(id, request);
    }

    @DeleteMapping("/{id}")
    @RateLimit(key = "address:delete", limit = 10, windowSeconds = 60)
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/default")
    @RateLimit(key = "address:default", limit = 10, windowSeconds = 60)
    public UserAddressDto setDefaultAddress(@PathVariable Long id) {
        return addressService.setDefaultAddress(id);
    }
}

