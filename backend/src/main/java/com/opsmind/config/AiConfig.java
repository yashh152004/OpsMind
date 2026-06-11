package com.opsmind.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "gemini.api")
@Data
public class AiConfig {
    private String key;
    private String url;
    private String modelName = "gemini-1.5-flash-latest"; // Using latest stable flash model
}
