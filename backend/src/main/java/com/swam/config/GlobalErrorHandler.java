package com.swam.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Global exception handler for the application.
 * Catches exceptions thrown by REST controllers and returns consistent error
 * responses.
 */
@org.springframework.web.bind.annotation.RestControllerAdvice
public class GlobalErrorHandler {
        private static final Logger log = LoggerFactory.getLogger(GlobalErrorHandler.class);

        /**
         * Handles Bean Validation errors (@Valid).
         */
        @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, Object>> handleValidation(
                        org.springframework.web.bind.MethodArgumentNotValidException ex, WebRequest request) {
                Map<String, String> errors = new HashMap<>();
                ex.getBindingResult().getFieldErrors()
                                .forEach(error -> {
                                        errors.put(error.getField(), error.getDefaultMessage());
                                        System.out.println("VALIDATION ERROR: " + error.getField() + " - "
                                                        + error.getDefaultMessage());
                                });

                return buildErrorResponse(
                                HttpStatus.BAD_REQUEST,
                                "Validation failed",
                                request.getDescription(false),
                                errors);
        }

        /**
         * Handles Hibernate/JPA constraint violations.
         */
        @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
        public ResponseEntity<Map<String, Object>> handleConstraintViolation(
                        jakarta.validation.ConstraintViolationException ex, WebRequest request) {
                return buildErrorResponse(
                                HttpStatus.BAD_REQUEST,
                                "Database constraint violation: " + ex.getMessage(),
                                request.getDescription(false));
        }

        /**
         * Handles IllegalArgumentException (e.g., invalid input parameters).
         */
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, Object>> handleIllegalArgument(
                        IllegalArgumentException ex, WebRequest request) {
                return buildErrorResponse(
                                HttpStatus.BAD_REQUEST,
                                ex.getMessage(),
                                request.getDescription(false));
        }

        /**
         * Handles NullPointerException (e.g., missing required data).
         */
        @ExceptionHandler(NullPointerException.class)
        public ResponseEntity<Map<String, Object>> handleNullPointer(
                        NullPointerException ex, WebRequest request) {
                log.error("Null Pointer Exception: ", ex);
                return buildErrorResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "A required field was null: " + ex.getMessage(),
                                request.getDescription(false));
        }

        /**
         * Handles generic exceptions that aren't caught by specific handlers.
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, Object>> handleGenericException(
                        Exception ex, WebRequest request) {
                log.error("Unhandled exception: {} - {}", ex.getClass().getName(), ex.getMessage(), ex);

                return buildErrorResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "An unexpected error occurred: " + ex.getMessage(),
                                request.getDescription(false));
        }

        /**
         * Handles resource not found exceptions.
         */
        @ExceptionHandler(java.util.NoSuchElementException.class)
        public ResponseEntity<Map<String, Object>> handleNotFound(
                        java.util.NoSuchElementException ex, WebRequest request) {
                return buildErrorResponse(
                                HttpStatus.NOT_FOUND,
                                "The requested resource was not found: " + ex.getMessage(),
                                request.getDescription(false));
        }

        /**
         * Handles access denied exceptions (authorization failures).
         */
        @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
        public ResponseEntity<Map<String, Object>> handleAccessDenied(
                        org.springframework.security.access.AccessDeniedException ex, WebRequest request) {
                log.warn("Access Denied for {}: {}", request.getDescription(false), ex.getMessage());
                return buildErrorResponse(
                                HttpStatus.FORBIDDEN,
                                "Permission denied: " + ex.getMessage(),
                                request.getDescription(false));
        }

        /**
         * Helper method to build consistent error response structure.
         */
        private ResponseEntity<Map<String, Object>> buildErrorResponse(
                        HttpStatus status, String message, String path) {
                return buildErrorResponse(status, message, path, null);
        }

        private ResponseEntity<Map<String, Object>> buildErrorResponse(
                        HttpStatus status, String message, String path, Map<String, String> details) {
                Map<String, Object> errorDetails = new HashMap<>();
                errorDetails.put("timestamp", LocalDateTime.now().toString());
                errorDetails.put("status", status.value());
                errorDetails.put("error", status.getReasonPhrase());
                errorDetails.put("message", message);
                errorDetails.put("path", path);
                if (details != null) {
                        errorDetails.put("details", details);
                }

                return new ResponseEntity<>(errorDetails, status);
        }
}
