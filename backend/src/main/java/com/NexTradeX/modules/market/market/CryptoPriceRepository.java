package com.nextradex.modules.market.market;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CryptoPriceRepository extends JpaRepository<CryptoPrice, Long> {
    Optional<CryptoPrice> findBySymbol(String symbol);
    List<CryptoPrice> findAll();
    boolean existsBySymbol(String symbol);
}
