package com.NexTradeX.margin;

import com.NexTradeX.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarginPositionRepository extends JpaRepository<MarginPosition, Long> {
    List<MarginPosition> findAllByUser(User user);
    List<MarginPosition> findAllByUserAndStatus(User user, String status);
    List<MarginPosition> findAllByUserAndSymbol(User user, String symbol);
    Optional<MarginPosition> findByUserAndSymbol(User user, String symbol);
    Optional<MarginPosition> findByIdAndUser(Long positionId, User user);

    List<MarginPosition> findAllByStatus(String status);

    @Modifying
    @Query("UPDATE MarginPosition p SET p.unrealizedPnL = :unrealizedPnL, p.marginRatio = :marginRatio, p.version = p.version + 1 WHERE p.id = :id AND p.status = 'OPEN'")
    int updateRiskFields(@Param("id") Long id, @Param("unrealizedPnL") BigDecimal unrealizedPnL, @Param("marginRatio") BigDecimal marginRatio);
}
