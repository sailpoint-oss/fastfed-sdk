
package com.sailpoint.fastfed.sdk.model;

import org.json.simple.JSONObject;

public class FastFedProvisioningObject extends FastFedObject {

    private String provisioningMetadataEndpointUrl;
    private String tokenEndpoint;
    private String scope;

    public String getTokenEndpoint() {
        return tokenEndpoint;
    }

    public String getScope() {
        return scope;
    }

    public String getProvisioningMetadataEndpointUrl() {
        return provisioningMetadataEndpointUrl;
    }

    /**
     * Create a ProvisioningFastFedObject
     *
     * @param entityId                        entityid of the provider
     * @param provisioningMetadataEndpointUrl the url of the provisioning server's metadata
     * @param tokenEndpoint                   an oAuth token endpoint url
     * @param scope                           oAuth token scope
     */
    public FastFedProvisioningObject(String entityId,
                                     String provisioningMetadataEndpointUrl,
                                     String tokenEndpoint,
                                     String scope,
                                     JSONObject providerFastFedMetadata) {

        super(entityId, providerFastFedMetadata);

        this.tokenEndpoint = tokenEndpoint;
        this.scope = scope;
        this.provisioningMetadataEndpointUrl = provisioningMetadataEndpointUrl;
    }
}
