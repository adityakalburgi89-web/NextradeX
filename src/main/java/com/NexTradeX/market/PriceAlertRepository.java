package com.NexTradeX.market;

import com.NexTradeX.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceAlertRepository extends JpaRepository<PriceAlert, Long> {
    List<PriceAlert> findAllByUser(User user);
    List<PriceAlert> findByActive(boolean active);
}
