package com.nextradex.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PriceAlertResponse {
    Long id;
    String symbol;
    BigDecimal targetPrice;
    String alertCondition;
    boolean active;
    LocalDateTime createdAt;
}
