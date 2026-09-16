package com.nextradex.api.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptionsBuyRequest {
    @NotBlank(message = "Symbol is required")
    private String symbol;
    
    @NotBlank(message = "Option type is required")
    private String optionType;
    
    @NotNull(message = "Strike price is required")
    @DecimalMin(value = "0.00000001", message = "Strike price must be greater than zero")
    @DecimalMax(value = "99999999999.99999999", message = "Strike price exceeds maximum allowed precision")
    private BigDecimal strikePrice;
    
    @NotNull(message = "Premium is required")
    @DecimalMin(value = "0.00000001", message = "Premium must be greater than zero")
    @DecimalMax(value = "99999999999.99999999", message = "Premium exceeds maximum allowed precision")
    private BigDecimal premium;
    
    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.00000001", message = "Quantity must be greater than zero")
    @DecimalMax(value = "99999999999.99999999", message = "Quantity exceeds maximum allowed precision")
    private BigDecimal quantity;
    
    @NotBlank(message = "Expiry date is required")
    private String expiryDate;
}
