package com.nextradex.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String symbol;
    private String side;
    private String orderType;
    private String status;
    private String tradeType;
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal filledQuantity;
    private BigDecimal averagePrice;
    private BigDecimal commission;
    private BigDecimal leverage;
    private LocalDateTime createdAt;
    private LocalDateTime filledAt;
    private String remarks;
}
