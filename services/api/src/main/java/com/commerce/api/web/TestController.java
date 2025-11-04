package com.commerce.api.web;

<<<<<<< HEAD
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {
    @GetMapping("/secure")
    @PreAuthorize("isAuthenticated()")
=======
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @GetMapping("/api/secure")
>>>>>>> 0e6e09fafc50d1dcaa282979bf7ce0bbe4ee35ea
    public String secure() {
        return "Authorized access";
    }
}
