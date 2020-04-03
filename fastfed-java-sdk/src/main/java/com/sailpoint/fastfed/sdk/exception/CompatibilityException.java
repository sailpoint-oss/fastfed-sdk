package com.sailpoint.fastfed.sdk.exception;

/**
 * Simple class to allow FastFed compatibility exception handling
 */
public class CompatibilityException extends Exception {
    public CompatibilityException(Exception e) {
        super(e);
    }
}
