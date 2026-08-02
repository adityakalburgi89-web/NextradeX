package com.NexTradeX.spot;

import java.math.BigDecimal;

public record SpotHoldingResponse(String asset, BigDecimal quantity, BigDecimal averageEntryPrice) {
    static SpotHoldingResponse from(SpotHolding holding) {
        return new SpotHoldingResponse(
                holding.getAsset(),
                holding.getQuantity(),
                holding.getAverageEntryPrice());
    }
}
