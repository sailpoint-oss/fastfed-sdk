package com.sailpoint.fastfed.sdk.model;

import org.json.simple.JSONObject;

public class FastFedAuthenticationObject extends FastFedObject {

    private String authMetadataEndpointUrl;

    /**
     * Retrieve the SAML metadata endpoint
     * @return SAML metadata endpoint url
     */
    public String getAuthMetadataEndpointUrl() {
        return this.authMetadataEndpointUrl;
    }

    /**
     * Construct a FastFed authentication object
     */
    public FastFedAuthenticationObject(String entityId,
                                       String authMetadataEndpointUrl,
                                       JSONObject providerFastFedMetadata) {

        super(entityId, providerFastFedMetadata);
        this.authMetadataEndpointUrl = authMetadataEndpointUrl;
    }
}
