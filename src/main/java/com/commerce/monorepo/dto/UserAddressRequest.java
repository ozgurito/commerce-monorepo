package com.commerce.monorepo.dto;

import com.commerce.monorepo.entity.UserAddress.AddressType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAddressRequest {

    @NotBlank(message = "Adres başlığı gerekli")
    @Size(max = 100)
    private String title;

    @NotBlank(message = "Alıcı adı gerekli")
    @Size(max = 200)
    private String fullName;

    @NotBlank(message = "Telefon gerekli")
    @Size(max = 20)
    private String phone;

    @NotBlank(message = "Şehir gerekli")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "İlçe gerekli")
    @Size(max = 100)
    private String district;

    @Size(max = 200)
    private String neighborhood;

    @NotBlank(message = "Adres gerekli")
    private String addressLine;

    @Size(max = 10)
    private String postalCode;

    private Boolean isDefault = false;

    private AddressType addressType = AddressType.SHIPPING;

}

