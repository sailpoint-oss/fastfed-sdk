package com.sailpoint.fastfed.sdk.providers;

import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.jwk.JWK;

public interface JwksProvider {
    String getMetadata();
    Payload getFastFedJwtPayload(String applicationProviderEntityId, long expirationTime);
    JWSHeader getFastFedJwtHeader(String applicationProviderEntityId);
    JWK getJwksPrivateKey(String kid);
}
