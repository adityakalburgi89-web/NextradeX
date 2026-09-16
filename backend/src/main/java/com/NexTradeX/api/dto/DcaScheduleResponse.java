package com.nextradex.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DcaScheduleResponse {
    Long id;
    String symbol;
    BigDecimal amountUSDT;
    int frequencySeconds;
    boolean active;
    LocalDateTime nextRunTime;
    LocalDateTime createdAt;
}
