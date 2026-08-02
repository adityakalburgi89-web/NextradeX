package com.nextradex.modules.trading.spot;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nextradex.modules.user.User;

import jakarta.persistence.LockModeType;

public interface SpotHoldingRepository extends JpaRepository<SpotHolding, Long> {
    List<SpotHolding> findAllByUserOrderByAsset(User user);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT h FROM SpotHolding h WHERE h.user = :user AND h.asset = :asset")
    Optional<SpotHolding> findByUserAndAssetForUpdate(@Param("user") User user, @Param("asset") String asset);

    void deleteAllByUser(User user);
}
