package com.nextradex.modules.trading.futures;

import com.nextradex.modules.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface FuturesPositionRepository extends JpaRepository<FuturesPosition, Long> {
    List<FuturesPosition> findAllByUser(User user);
    List<FuturesPosition> findAllByUserAndStatus(User user, PositionStatus status);
    List<FuturesPosition> findAllByUserAndSymbol(User user, String symbol);
    Optional<FuturesPosition> findByUserAndSymbolAndPositionMode(User user, String symbol, PositionMode positionMode);
    Optional<FuturesPosition> findByIdAndUser(Long positionId, User user);
    
    List<FuturesPosition> findAllByStatus(PositionStatus status);

    @Modifying
    @Query("UPDATE FuturesPosition p SET p.markPrice = :markPrice, p.unrealizedPnL = :unrealizedPnL, p.marginRatio = :marginRatio, p.version = p.version + 1 WHERE p.id = :id AND p.status = com.nextradex.modules.trading.futures.PositionStatus.OPEN")
    int updateRiskFields(@Param("id") Long id, @Param("markPrice") BigDecimal markPrice, @Param("unrealizedPnL") BigDecimal unrealizedPnL, @Param("marginRatio") BigDecimal marginRatio);
}
