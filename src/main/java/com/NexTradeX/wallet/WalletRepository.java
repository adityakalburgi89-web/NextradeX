package com.NexTradeX.wallet;

import com.NexTradeX.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserAndWalletType(User user, WalletType walletType);
    List<Wallet> findAllByUser(User user);
    boolean existsByUserAndWalletType(User user, WalletType walletType);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.id = :walletId")
    Optional<Wallet> findByIdForUpdate(@Param("walletId") Long walletId);
}
