package com.NexTradeX.exception;

import com.NexTradeX.common.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InsufficientBalanceException.class)
    ResponseEntity<ApiResponse<String>> handleInsufficientBalance(
            InsufficientBalanceException ex, WebRequest request) {
        log.error("Insufficient balance: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                .body(new ApiResponse<>(402, ex.getMessage(), null));
    }

    @ExceptionHandler(OrderNotFoundException.class)
    ResponseEntity<ApiResponse<String>> handleOrderNotFound(
            OrderNotFoundException ex, WebRequest request) {
        log.error("Order not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(404, ex.getMessage(), null));
    }

    @ExceptionHandler(InvalidOrderException.class)
    ResponseEntity<ApiResponse<String>> handleInvalidOrder(
            InvalidOrderException ex, WebRequest request) {
        log.error("Invalid order: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(400, ex.getMessage(), null));
    }

    @ExceptionHandler(LiquidationException.class)
    ResponseEntity<ApiResponse<String>> handleLiquidation(
            LiquidationException ex, WebRequest request) {
        log.error("Liquidation occurred: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiResponse<>(409, ex.getMessage(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<String>> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        String message = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce("", (a, b) -> a + ", " + b);
        if (message.startsWith(", ")) {
            message = message.substring(2);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(400, "Validation failed: " + message, null));
    }

    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    ResponseEntity<ApiResponse<String>> handleConstraintViolation(
            jakarta.validation.ConstraintViolationException ex, WebRequest request) {
        String message = ex.getConstraintViolations()
                .stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .reduce("", (a, b) -> a + ", " + b);
        if (message.startsWith(", ")) {
            message = message.substring(2);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(400, "Validation failed: " + message, null));
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiResponse<String>> handleAccessDenied(
            AccessDeniedException ex, WebRequest request) {
        log.error("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(403, "Access Denied", null));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ApiResponse<String>> handleNoResourceFound(
            NoResourceFoundException ex, WebRequest request) {
        log.error("No resource found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(404, ex.getMessage(), null));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<String>> handleGlobalException(
            Exception ex, WebRequest request) {
        log.error("Unexpected error: ", ex);
        String msg = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(500, msg, null));
    }
}

