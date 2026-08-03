package com.nextradex.modules.trading.spot;

import com.nextradex.modules.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpotTradeRepository extends JpaRepository<SpotTrade, Long> {
    List<SpotTrade> findAllByUser(User user);
    List<SpotTrade> findAllByUserAndSymbol(User user, String symbol);
}
