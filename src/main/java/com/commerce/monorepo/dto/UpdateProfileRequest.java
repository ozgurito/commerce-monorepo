package com.commerce.monorepo.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @Size(min = 2, max = 100, message = "İsim 2-100 karakter arasında olmalı")
    String fullName,

    @Size(max = 20, message = "Telefon en fazla 20 karakter olabilir")
    @Pattern(regexp = "^[0-9+\\-\\s]*$", message = "Geçersiz telefon formatı")
    String phone,

    @Pattern(regexp = "^[0-9]{11}$", message = "T.C. kimlik no 11 haneli sayı olmalı")
    String identityNumber
) {}

