package com.NexTradeX.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptionsBuyRequest {
    @NotBlank(message = "Symbol is required")
    private String symbol;
    
    @NotBlank(message = "Option type is required")
    private String optionType;
    
    @NotNull(message = "Strike price is required")
    private String strikePrice;
    
    @NotNull(message = "Premium is required")
    private String premium;
    
    @NotNull(message = "Quantity is required")
    private String quantity;
    
    @NotBlank(message = "Expiry date is required")
    private String expiryDate;
}
