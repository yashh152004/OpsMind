package com.opsmind.core.infrastructure.exception;

/**
 * Resource Not Found Exception
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public static ResourceNotFoundException notFound(String resourceType, String id) {
        return new ResourceNotFoundException(resourceType + " with ID " + id + " not found");
    }

    public static ResourceNotFoundException notFound(String resourceType) {
        return new ResourceNotFoundException(resourceType + " not found");
    }
}
