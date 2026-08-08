package com.NexTradeX.shared.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvents {

    private String orderId;
    private String userid;
    private String symbol;
    private String side; // => BUY OR SELL
    private String ordertype; // => MARKET OR LIMIT
    private BigDecimal quantity;
    private String status;
    private BigDecimal price; // => STATUS FILL CANCEL;
    private long timestamp;

}
