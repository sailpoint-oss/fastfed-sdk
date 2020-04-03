package com.sailpoint.fastfed.sdk.services;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.RSAKey;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.apache.http.util.TextUtils;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.sailpoint.fastfed.sdk.providers.JwksProvider;

import java.net.URI;
import java.util.Date;

/**
 * Service for all of the Jwks related functionality
 */
public class JwksSdkService extends SdkServiceBase {

    private static final Logger LOG = LoggerFactory
            .getLogger(JwksSdkService.class);

    private JwksProvider jwksProvider;

    public JwksSdkService(JwksProvider jwksProvider) throws Exception {
        super();

        this.jwksProvider = jwksProvider;
    }

    /**
     * This method is called to retrieve JWKS information from this server
     *
     * @return JSON string of the JWKS keys (public keys only)
     */
    public String getJwksMetadata() throws Exception {
        return jwksProvider.getMetadata();
    }

    /*
    Get the private key for a specific kid from this server
    */
    public JWK getPrivateKey(String kid) {
        return this.jwksProvider.getJwksPrivateKey(kid);
    }

    /**
     * Build the signed JWT for a specific provider's payload and header implementation
     *
     * @return the JSON string of the JWT
     */
    public String getSignedJwtJson(String applicationProviderEntityId)
            throws JOSEException {

        long resolvedExpirationTime = getExpirationTime();

        Payload payload = this.jwksProvider.getFastFedJwtPayload(applicationProviderEntityId, resolvedExpirationTime);
        JWSHeader header = this.jwksProvider.getFastFedJwtHeader(applicationProviderEntityId);

        String kid = header.getKeyID();
        if (TextUtils.isEmpty(kid)) {
            throw new Error("There is no kid specified in the Jwt header");
        }

        JWSObject jws = new JWSObject(header, payload);

        RSAKey jwkKey = (RSAKey) getPrivateKey(kid);
        JWSSigner signer = new RSASSASigner(jwkKey.toPrivateKey());
        jws.sign(signer);

        return jws.serialize();
    }

    /**
     * Get a bearer token from an oauth endpoint of a service provider
     *
     * @param tokenEndpoint the url of the token endpoint
     * @param scope         reserved, should be SCIM for now
     * @return bearer token information
     * @throws Exception
     */
    public JSONObject getOAuthBearerToken(String entityId, String tokenEndpoint, String scope) throws Exception {

        JSONObject bearerTokenObj = null;

        // create a JWT-bearer.  For now, we only have one key/pair so use 'default'
        String token = getSignedJwtJson(entityId);

        // keep it simple for now.  not using a WebFinger account but can add one at some point
        try (CloseableHttpClient httpClient = HttpClientBuilder.create().build()) {

            URIBuilder builder = new URIBuilder(tokenEndpoint);
            URI uri = builder
                    .addParameter("assertion", token)
                    .build();

            HttpPost httpPost = new HttpPost(uri);

            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                String bearerToken = EntityUtils.toString(response.getEntity());
                bearerTokenObj = (JSONObject) new JSONParser().parse(bearerToken);
            }
        } catch (Exception e) {
            LOG.error("Unable to retrieve the oauth bearer token: " + e.getMessage());
            throw e;
        }

        return bearerTokenObj;
    }

    protected long getExpirationTime() {
        return new Date().getTime() + (getFastFedSdkProperties().getJwtExpirationMinutes() * 60);
    }
}
