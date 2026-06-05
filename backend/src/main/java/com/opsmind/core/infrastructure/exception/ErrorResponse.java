package com.opsmind.core.infrastructure.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standard error response format for all API errors
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private int statusCode;
    private String errorCode;
    private String message;
    private LocalDateTime timestamp;
    private String traceId;
    private String path;
    private List<ErrorDetail> errors;
}

/**
 * Error detail for individual field validation errors
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class ErrorDetail {
    private String field;
    private Object value;
    private String message;
}
