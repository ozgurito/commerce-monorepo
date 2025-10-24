package com.commerce.api.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @GetMapping("/api/secure")
    public String secure() {
        return "Authorized access";
    }
}
