package com.nextradex.shared.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

import lombok.Getter;

@Getter
public final class Money {

    public static final Money ZERO = new Money(BigDecimal.ZERO, Currency.USDT);

    private final BigDecimal amount;
    private final Currency currency;

    public Money(BigDecimal amount, Currency currency) {
        this.amount = Objects.requireNonNull(amount, "Amount cannot be null")
                .setScale(8, RoundingMode.HALF_EVEN);
        this.currency = Objects.requireNonNull(currency, "Currency cannot be null");
    }

    public static Money of(double amount, Currency currency) {
        return new Money(BigDecimal.valueOf(amount), currency);
    }

    public Money add(Money other) {
        verifySameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money subtract(Money other) {
        verifySameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }

    private void verifySameCurrency(Money other) {
        if (this.currency != other.currency) {
            throw new IllegalArgumentException("Cannot operate on different currencies: " + this.currency + " vs " + other.currency);
        }
    }
}
