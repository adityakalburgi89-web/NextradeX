package com.nextradex.api.dto;

import jakarta.validation.constraints.DecimalMax;
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
    @DecimalMax(value = "99999999999.99999999", message = "Quantity exceeds maximum allowable digits")
    private BigDecimal quantity;
    
    @DecimalMin(value = "0.00000001", message = "Price must be greater than zero")
    @DecimalMax(value = "99999999999.99999999", message = "Price exceeds maximum allowable digits")
    private BigDecimal price;

    @DecimalMax(value = "99999999999.99999999", message = "Stop price exceeds maximum allowable digits")
    private BigDecimal stopPrice;
}
