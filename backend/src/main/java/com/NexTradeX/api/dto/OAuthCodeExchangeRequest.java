package com.nextradex.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OAuthCodeExchangeRequest {

    @NotBlank(message = "OAuth login code is required")
    @Size(max = 128, message = "OAuth login code is invalid")
    private String code;
}
