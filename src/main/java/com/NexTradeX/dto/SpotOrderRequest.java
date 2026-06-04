package com.NexTradeX.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpotOrderRequest {
    
    @NotBlank(message = "Symbol is required")
    private String symbol;
    
    @NotBlank(message = "Side is required (BUY/SELL)")
    private String side;
    
    @NotBlank(message = "Order type is required (MARKET/LIMIT)")
    private String orderType;
    
    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.00000001", message = "Quantity must be greater than zero")
    private BigDecimal quantity;
    
    @DecimalMin(value = "0.00000001", message = "Price must be greater than zero")
    private BigDecimal price;

    private BigDecimal stopPrice;
}
