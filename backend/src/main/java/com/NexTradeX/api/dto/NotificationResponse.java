package com.nextradex.api.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class NotificationResponse {
    Long id;
    String title;
    String message;
    boolean read;
    LocalDateTime createdAt;
}
