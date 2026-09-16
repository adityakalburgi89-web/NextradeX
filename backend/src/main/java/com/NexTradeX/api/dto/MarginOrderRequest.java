package com.nextradex.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
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
public class MarginOrderRequest {
    
    @NotBlank(message = "Symbol is required")
    private String symbol;
    
    @NotBlank(message = "Side is required (BUY/SELL)")
    private String side;
    
    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.00000001", message = "Quantity must be greater than zero")
    @DecimalMax(value = "99999999999.99999999", message = "Quantity exceeds maximum allowable digits")
    private BigDecimal quantity;
    
    @NotNull(message = "Leverage is required")
    @DecimalMin(value = "2", message = "Margin leverage must be at least 2x")
    @DecimalMax(value = "10", message = "Margin leverage cannot exceed 10x")
    private BigDecimal leverage;
}
