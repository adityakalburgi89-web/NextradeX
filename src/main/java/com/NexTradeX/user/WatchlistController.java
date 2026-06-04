package com.NexTradeX.user;

import com.NexTradeX.auth.JwtService;
import com.NexTradeX.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/watchlist")
@RequiredArgsConstructor
@Transactional
public class WatchlistController {

    private final WatchlistItemRepository watchlistRepository;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/toggle")
    public ResponseEntity<ApiResponse<Boolean>> toggleWatchlist(
            @RequestParam String symbol,
            Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String normalizedSymbol = symbol.toUpperCase().trim();
            var itemOpt = watchlistRepository.findByUserAndSymbol(user, normalizedSymbol);

            if (itemOpt.isPresent()) {
                watchlistRepository.deleteByUserAndSymbol(user, normalizedSymbol);
                return ResponseEntity.ok(new ApiResponse<>(200, "Removed from watchlist", false));
            } else {
                WatchlistItem item = WatchlistItem.builder()
                        .user(user)
                        .symbol(normalizedSymbol)
                        .addedAt(LocalDateTime.now())
                        .build();
                watchlistRepository.save(item);
                return ResponseEntity.ok(new ApiResponse<>(200, "Added to watchlist", true));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<String>>> getWatchlist(Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<WatchlistItem> items = watchlistRepository.findAllByUser(user);
            List<String> symbols = items.stream()
                    .map(WatchlistItem::getSymbol)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(200, "Watchlist symbols retrieved", symbols));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
}
