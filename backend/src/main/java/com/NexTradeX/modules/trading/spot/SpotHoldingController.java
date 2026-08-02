package com.nextradex.modules.trading.spot;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nextradex.modules.security.auth.IJwtService;
import com.nextradex.shared.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/spot/holdings")
@RequiredArgsConstructor
public class SpotHoldingController {

    private final SpotHoldingService holdingService;
    private final IJwtService jwtService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SpotHoldingResponse>>> getHoldings(Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        return ResponseEntity.ok(new ApiResponse<>(200, "Spot holdings retrieved",
                holdingService.getUserHoldings(userId)));
    }
}
