package com.sailpoint.fastfed.sdk.model;

public enum FastFedDiscoveryType {

    WEBFINGER,
    MANUAL;

    public static FastFedDiscoveryType fromString(final String text) {
       return valueOf(text.toUpperCase());
    }
}
