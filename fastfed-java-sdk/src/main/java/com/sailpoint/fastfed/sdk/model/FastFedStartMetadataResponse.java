package com.sailpoint.fastfed.sdk.model;

import java.util.UUID;

/**
 * POJO for returning information to a UI about how to kick off the FastFed process
 */
public class FastFedStartMetadataResponse {

    private String id;
    private String startUrl;
    private boolean isError;
    private String message;

    public FastFedStartMetadataResponse() {
        this.id = UUID.randomUUID().toString();
        this.isError = false;
        this.message = "";
    }

    public String getId() {
        return id;
    }

    protected void setId(String id) {
        this.id = id;
    }


    public String getStartUrl() {
        return startUrl;
    }

    public void setStartUrl(String startUrl) {
        this.startUrl = startUrl;
    }

    public boolean isError() {
        return isError;
    }

    public void setError(boolean error) {
        isError = error;
    }


    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
