package com.nextradex.shared.messaging;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class NotificationEvent {

    public enum NotificationType {
        PRICE_ALERT,
        ORDER_STATUS,
        MARGIN_CALL,
        SYSTEM_INFO
    }

    public enum Severity {
        INFO, SUCCESS, WARNING, DANGER
    }

    private String id;
    private String userId;
    private String title;
    private String symbol;
    private String message;
    private double targetPrice;
    private double currentPrice;
    private Instant timestamp;
    private NotificationType type;
    private Severity severity;
}
