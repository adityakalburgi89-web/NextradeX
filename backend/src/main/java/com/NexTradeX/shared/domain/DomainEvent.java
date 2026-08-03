package com.nextradex.shared.domain;

import java.time.Instant;
import java.util.UUID;

import lombok.Getter;

@Getter
public abstract class DomainEvent {

    private final String eventId;
    private final Instant occurredOn;

    protected DomainEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.occurredOn = Instant.now();
    }
}
