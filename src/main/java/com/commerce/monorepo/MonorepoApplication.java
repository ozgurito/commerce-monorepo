package com.commerce.monorepo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.Locale;

@SpringBootApplication
public class MonorepoApplication {

	public static void main(String[] args) {
		// FIX: Turkish Locale Bug - prevents "MIN" becoming "mın" in SQL
		// This must be set BEFORE Spring context initializes
		Locale.setDefault(Locale.ENGLISH);
		
		SpringApplication.run(MonorepoApplication.class, args);
	}

}
