package com.opsmind.core.infrastructure.exception;

import org.springframework.http.HttpStatus;
import lombok.Getter;

/**
 * Base application exception class
 */
@Getter
public class ApplicationException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus statusCode;

    public ApplicationException(String message, String errorCode, HttpStatus statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }

    public ApplicationException(String message, Throwable cause, String errorCode, HttpStatus statusCode) {
        super(message, cause);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }
}
