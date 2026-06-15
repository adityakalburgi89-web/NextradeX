package com.NexTradeX.market;

import com.NexTradeX.auth.JwtService;
import com.NexTradeX.common.ApiResponse;
import com.NexTradeX.user.User;
import com.NexTradeX.user.UserService;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/market/alerts")
@RequiredArgsConstructor
@Validated
public class PriceAlertController {

    private final PriceAlertRepository priceAlertRepository;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<ApiResponse<PriceAlert>> createAlert(
            @RequestParam String symbol,
            @RequestParam @DecimalMin(value = "0.00000001", message = "Price must be greater than zero") @DecimalMax(value = "99999999999.99999999", message = "Price exceeds maximum allowed precision") BigDecimal targetPrice,
            @RequestParam String condition,
            Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            PriceAlert alert = PriceAlert.builder()
                    .user(user)
                    .symbol(symbol.toUpperCase())
                    .targetPrice(targetPrice)
                    .alertCondition(condition.toUpperCase())
                    .active(true)
                    .build();

            PriceAlert saved = priceAlertRepository.save(alert);
            return ResponseEntity.ok(new ApiResponse<>(200, "Price alert created", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PriceAlert>>> getAlerts(Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<PriceAlert> alerts = priceAlertRepository.findAllByUser(user);
            return ResponseEntity.ok(new ApiResponse<>(200, "Price alerts retrieved", alerts));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{alertId}")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(
            @PathVariable Long alertId,
            Authentication authentication) {
        try {
            priceAlertRepository.deleteById(alertId);
            return ResponseEntity.ok(new ApiResponse<>(200, "Price alert deleted", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
}
