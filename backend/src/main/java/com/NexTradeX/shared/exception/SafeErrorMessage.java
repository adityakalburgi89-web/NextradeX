package com.nextradex.shared.exception;

public final class SafeErrorMessage {

    public static final String GENERIC = "An unexpected error occurred. Please try again later.";

    private SafeErrorMessage() {
    }

    public static String forClient(Throwable exception) {
        if (exception instanceof InsufficientBalanceException
                || exception instanceof InvalidOrderException
                || exception instanceof OrderNotFoundException
                || exception instanceof LiquidationException) {
            String message = exception.getMessage();
            return message == null || message.isBlank() ? GENERIC : message;
        }
        return GENERIC;
    }
}
