package com.NexTradeX.shared.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {
    private String orderId;
    private String userId;
    private String symbol;
    private String side;
    private String orderType;
    private String status;
    private long timestamp;
    private BigDecimal quantity;
    private BigDecimal price;

}
