package com.nextradex.api.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
@ConditionalOnProperty(prefix = "nextradex.scheduling", name = "enabled", havingValue = "true", matchIfMissing = true)
public class SchedulingConfig {
}
