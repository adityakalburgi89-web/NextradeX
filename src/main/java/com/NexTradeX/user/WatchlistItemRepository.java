package com.NexTradeX.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, Long> {
    List<WatchlistItem> findAllByUser(User user);
    Optional<WatchlistItem> findByUserAndSymbol(User user, String symbol);
    void deleteByUserAndSymbol(User user, String symbol);
}
