package com.commerce.monorepo.dto;

import com.commerce.monorepo.entity.UserAddress.AddressType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAddressDto {

    private Long id;
    private String title;
    private String fullName;
    private String phone;
    private String city;
    private String district;
    private String neighborhood;
    private String addressLine;
    private String postalCode;
    private Boolean isDefault;
    private AddressType addressType;
    private String formattedAddress;

}

