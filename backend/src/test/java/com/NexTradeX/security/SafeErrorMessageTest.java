package com.nextradex.security;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.nextradex.shared.exception.InsufficientBalanceException;
import com.nextradex.shared.exception.SafeErrorMessage;
import java.sql.SQLException;
import org.junit.jupiter.api.Test;

class SafeErrorMessageTest {

    @Test
    void databaseDetailsAreMasked() {
        SQLException exception = new SQLException("insert into users ... password_hash ...");

        assertEquals(SafeErrorMessage.GENERIC, SafeErrorMessage.forClient(exception));
    }

    @Test
    void explicitDomainErrorsRemainActionable() {
        InsufficientBalanceException exception =
                new InsufficientBalanceException("Insufficient balance for purchase");

        assertEquals("Insufficient balance for purchase", SafeErrorMessage.forClient(exception));
    }
}
