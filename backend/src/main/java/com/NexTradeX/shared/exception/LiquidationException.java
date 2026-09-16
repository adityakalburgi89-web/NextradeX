package com.nextradex.shared.exception;

public class LiquidationException extends RuntimeException {
    public LiquidationException(String message) {
        super(message);
    }

    public LiquidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
