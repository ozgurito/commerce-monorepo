package com.commerce.api.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String,String> health(){
        return Map.of("status","ok");
    }

    @GetMapping("/hello")
    public Map<String,String> hello(){
        return Map.of("message","ok");
    }
}
