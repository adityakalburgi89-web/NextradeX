package com.nextradex.modules.market.market;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceUpdateDTO {
    private String symbol;
    private BigDecimal currentPrice;
    private BigDecimal highPrice;
    private BigDecimal lowPrice;
    private BigDecimal openPrice;
    private BigDecimal priceChange24h;
    private BigDecimal percentChange24h;
    private BigDecimal volume24h;
    private BigDecimal marketCap;
}
