package com.nextradex.modules.trading.spot;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import com.nextradex.modules.user.User;

class SpotHoldingTest {

    @Test
    void tracksAssetQuantityAndWeightedEntryPrice() {
        SpotHolding holding = SpotHolding.create(User.builder().id(1L).build(), "BTC");

        holding.recordPurchase(new BigDecimal("1"), new BigDecimal("100"));
        holding.recordPurchase(new BigDecimal("1"), new BigDecimal("200"));
        holding.recordSale(new BigDecimal("0.5"));

        assertEquals(0, holding.getQuantity().compareTo(new BigDecimal("1.5")));
        assertEquals(0, holding.getAverageEntryPrice().compareTo(new BigDecimal("150")));
    }

    @Test
    void rejectsSellingMoreThanTheOwnedAsset() {
        SpotHolding holding = SpotHolding.create(User.builder().id(1L).build(), "ETH");
        holding.recordPurchase(BigDecimal.ONE, new BigDecimal("100"));

        assertThrows(IllegalArgumentException.class,
                () -> holding.recordSale(new BigDecimal("2")));
    }
}
