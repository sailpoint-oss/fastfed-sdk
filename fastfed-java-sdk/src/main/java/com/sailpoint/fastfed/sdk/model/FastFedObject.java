package com.sailpoint.fastfed.sdk.model;

import org.json.simple.JSONObject;

public class FastFedObject {

    private String entityId;
    private JSONObject fastfedMetadata;

    /**
     * Get FastFed metadata for the provider
     * @return JSONObject of the FastFed metadata
     */
    public JSONObject getFastfedMetadata() {
        return fastfedMetadata;
    }

    public String getEntityId() {
        return entityId;
    }

    public FastFedObject(String entityId, JSONObject fastfedMetadata) {
        this.entityId = entityId;
        this.fastfedMetadata = fastfedMetadata;
    }

}
