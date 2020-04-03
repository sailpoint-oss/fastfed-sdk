package com.sailpoint.fastfed.sdk.exception;

/**
 * Simple class to allow whitelisting exception handling
 */
public class WhitelistedException extends Exception {
    public WhitelistedException(String message) {
        super(message);
    }

    public WhitelistedException(Exception e) {
        super(e);
    }
}
