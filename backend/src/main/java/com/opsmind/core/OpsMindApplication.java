package com.opsmind.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * OpsMind Backend Application - Main Entry Point
 * 
 * Features:
 * - Multi-tenant SaaS platform
 * - Real-time incident management
 * - AI-powered root cause analysis
 * - Centralized log analytics
 * - Alert management and correlation
 * 
 * @author OpsMind Team
 * @version 1.0.0
 */
@SpringBootApplication(scanBasePackages = "com.opsmind")
@EnableFeignClients(basePackages = "com.opsmind")
@EnableJpaAuditing
@EnableKafka
@EnableAsync
@EnableScheduling
@EnableAspectJAutoProxy
public class OpsMindApplication {

    public static void main(String[] args) {
        SpringApplication.run(OpsMindApplication.class, args);
    }

}
