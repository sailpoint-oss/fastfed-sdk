package com.sailpoint.fastfed.sdk.providers;

import com.sailpoint.fastfed.sdk.model.FastFedAuthenticationObject;
import com.sailpoint.fastfed.sdk.model.FastFedProvisioningObject;
import org.json.simple.JSONObject;
import com.sailpoint.fastfed.sdk.model.DuplicateCheckResult;

public interface FastFedProvider {

    String getMetadata();

    void addAuthenticationApplication(FastFedAuthenticationObject fastFedAuthenticationObject) throws Exception;
    void removeAuthenticationApplication(String entityId) throws Exception;
    void addProvisioningApplication(FastFedProvisioningObject fastFedProvisioningObject) throws Exception;
    void removeProvisioningApplication(String entityId) throws Exception;

    DuplicateCheckResult getDuplicateCheckResult(JSONObject providerMetadata);

}
