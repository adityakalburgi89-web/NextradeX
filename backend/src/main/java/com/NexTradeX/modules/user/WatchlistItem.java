package com.nextradex.modules.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "watchlist_items", indexes = {
        @Index(name = "idx_watchlist_user_symbol", columnList = "user_id,symbol", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchlistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime addedAt = LocalDateTime.now();
}
