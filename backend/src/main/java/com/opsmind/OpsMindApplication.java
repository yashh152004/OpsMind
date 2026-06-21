package com.opsmind;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableScheduling
public class OpsMindApplication {
    public static void main(String[] args) {
        // Load .env file from the project root or current directory
        Dotenv dotenv = Dotenv.configure()
                .directory("..") // Try parent directory (project root)
                .ignoreIfMissing()
                .load();

        // If parent doesn't have it, try current directory
        if (dotenv.get("DB_PASSWORD") == null) {
            dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .load();
        }

        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });

        SpringApplication.run(OpsMindApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.web.filter.CommonsRequestLoggingFilter requestLoggingFilter() {
        org.springframework.web.filter.CommonsRequestLoggingFilter loggingFilter = new org.springframework.web.filter.CommonsRequestLoggingFilter();
        loggingFilter.setIncludeClientInfo(true);
        loggingFilter.setIncludeQueryString(true);
        loggingFilter.setIncludePayload(true);
        loggingFilter.setMaxPayloadLength(10000);
        loggingFilter.setIncludeHeaders(true);
        return loggingFilter;
    }
}
