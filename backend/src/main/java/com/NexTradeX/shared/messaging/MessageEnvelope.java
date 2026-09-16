package com.nextradex.shared.messaging;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageEnvelope<T> {

    private String messageId;
    private String eventType;
    private String correlationId;
    private Instant timestamp;
    private T payload;

    public static <T> MessageEnvelope<T> wrap(String eventType, T payload, String correlationId) {
        return MessageEnvelope.<T>builder()
                .messageId(UUID.randomUUID().toString())
                .eventType(eventType)
                .correlationId(correlationId)
                .timestamp(Instant.now())
                .payload(payload)
                .build();
    }
}
