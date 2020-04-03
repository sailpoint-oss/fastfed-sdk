package com.sailpoint.fastfed.sdk.services;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sailpoint.fastfed.sdk.Constants;
import com.sailpoint.fastfed.sdk.FastFedSdkProperties;
import com.sailpoint.fastfed.sdk.exception.CompatibilityException;
import com.sailpoint.fastfed.sdk.exception.WhitelistedException;
import com.sailpoint.fastfed.sdk.model.*;
import net.openid.fastfed.sdk.model.*;
import com.sailpoint.fastfed.sdk.providers.ApplicationProvider;
import com.sailpoint.fastfed.sdk.providers.IdentityProvider;
import com.sailpoint.fastfed.sdk.providers.JwksProvider;
import com.sailpoint.fastfed.sdk.providers.WhitelistProvider;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;
import java.util.Optional;

/**
 * Service for all of the FastFed related functionality
 */
public class FastFedSdkService extends SdkServiceBase {
    private static final Logger LOG = LoggerFactory
            .getLogger(FastFedSdkService.class);

    private WhitelistProvider whitelistProvider;
    private IdentityProvider idpProvider;
    private ApplicationProvider appProvider;

    private WebFingerSdkService webFingerService;
    private JwksSdkService jwksService;
    private FastFedSdkProperties properties;

    public FastFedSdkService(IdentityProvider idpProvider,
                             JwksProvider jwksProvider,
                             WhitelistProvider whitelistProvider) throws Exception {

        this(idpProvider, null, jwksProvider, whitelistProvider);
    }

    public FastFedSdkService(ApplicationProvider appProvider,
                             JwksProvider jwksProvider,
                             WhitelistProvider whitelistProvider) throws Exception {

        this(null, appProvider, jwksProvider, whitelistProvider);
    }

    public FastFedSdkService(IdentityProvider idpProvider,
                             ApplicationProvider appProvider,
                             JwksProvider jwksProvider,
                             WhitelistProvider whitelistProvider) throws Exception {
        super();

        this.idpProvider = idpProvider;
        this.appProvider = appProvider;
        this.whitelistProvider = whitelistProvider;

        this.webFingerService = new WebFingerSdkService();
        this.jwksService = new JwksSdkService(jwksProvider);


    }

    /**
     * Starts and runs the complete FastFed handshake.  When this is called, this application is acting as a server (ie, an IdP or Governance Provider)
     *
     * @param applicationServerFastFedMetdataUrl the url to the server (initiator) that started this process FastFed metadata
     */
    public void start(String applicationServerFastFedMetdataUrl) throws Exception {
        LOG.debug("start method called.");

        JSONObject appProviderFastFedMetadataObject = getFastFedProviderMetadata(
                applicationServerFastFedMetdataUrl, Constants.APPLICATION_PROVIDER);

        if (appProviderFastFedMetadataObject == null) {
            throw new Exception("Retrieved invalid FastFed metadata from initiator's FastFed endpoint.");
        }

        String entityId = appProviderFastFedMetadataObject.get(Constants.ENTITY_ID).toString();
        verifyCompatibility(appProviderFastFedMetadataObject);

        // get the full registration response from the app provider and then process it
        JSONObject registerResponseMetadata = postFastFedHandshakeRegisterMetadata(appProviderFastFedMetadataObject);
        processApplicationProviderRegistrationResponse(
                entityId, registerResponseMetadata, appProviderFastFedMetadataObject);

        postFastFedFinalize(entityId, registerResponseMetadata);
    }


    /**
     * This method is used by IDN to retrieve the information about the FastFed start endpoint.  This MUST
     * be called because this is what whitelists the provider based on the provider's FastFed metadata.  This is
     * applicable when this server is acting as the initiating server (the one that will call the remote /start endpoint)
     *
     * @param type                    @see fastfed.atlas.model.FastFedHandshakeType
     * @param account                 the email account that will be used to perform WebFinger discovery (only for type AUTHENTICATION)
     * @param fastfedMetadataEndpoint the fastfed metadata endpoint url (only for type GOVERNANCE)
     * @return FastFedStartResponse object with information for the UI to use to kick off the process
     */
    public FastFedStartMetadataResponse discoverStartServerMetadata(FastFedDiscoveryType type,
                                                                    Optional<String> account,
                                                                    Optional<String> fastfedMetadataEndpoint) throws Exception {

        FastFedStartMetadataResponse metadata = null;
        String fastFedMetadataUrl;

        LOG.debug("discoverStartServerMetadata called");
        try {

            if (type == FastFedDiscoveryType.WEBFINGER) {
                // get the fastfed metadata for the specified account
                fastFedMetadataUrl = getFastfedMetadataUrl(account.orElseThrow(() ->
                        new Exception("Account must be specified in the query string for WEBFINGER type.")
                ));
            } else if (type == FastFedDiscoveryType.MANUAL) {
                fastFedMetadataUrl = fastfedMetadataEndpoint.orElseThrow(() ->
                        new Exception("fastfedMetadataEndpoint must be specified in the query string for MANUAL type.")
                );
            } else {
                throw new Exception("Invalid discovery type specified");
            }

            if (fastFedMetadataUrl == null) {
                throw new Exception("Unable to retrieve the FastFed metadata endpoint through discovery.");
            }

            LOG.debug("fastFedMetadataUrl set to: " + fastFedMetadataUrl);
            metadata = retrieveIdPMetadata(fastFedMetadataUrl);

        } catch (Exception ex) {
            LOG.error(ex.toString());
            throw ex;
        }

        return metadata;
    }

    /**
     * Allows for the provider to call back to this application provider to indicate that it successfully completed
     * its side of the handshake
     *
     * @param token an undecoded, signed JWT token
     * @throws IOException
     */
    public void finalizeFastFed(String token) throws Exception {
        LOG.debug("Entered finalizeFastFed");

        try {
            // decode the token, throw an error if invalid
            JWTVerifyResult verifyResult = verifyJwt(token);

            // update the whitelist if we decode and verify the JWT  properly.
            whitelistProvider.update(toWhiteListRecord(verifyResult.getJwt()));

        } catch (Exception ex) {
            LOG.error("Unable to finalize the handshake: " + ex);
            throw ex;
        }
    }

    /**
     * FastFed registration endpoint
     * <p>
     * Called by the provider with a signed JWT for us to verify it is a previously whitelisted provider.
     * If valid, this will use the information in the payload to retrieve the provider's SCIM and SAML metadata
     * and call IDN's API to configure SSO and/or create an app
     *
     * @param token an undecoded, signed JWT token
     * @returns the registration's response JSON
     */
    public String handshakeRegister(String token) throws Exception {

        LOG.debug("Entered handshakeRegister");

        String registerResponseBody = null;

        try {
            JWTVerifyResult verifyResult = verifyJwt(token);
            processRegistrationRequestFromIdP(verifyResult.getJwt(),
                    parseJson(verifyResult.getWhitelistRecord().getFastfedMetadataJson()));

            registerResponseBody = this.appProvider.getRegistrationMetadata();

        } catch (Exception ex) {
            LOG.error(ex.getMessage());
            throw ex;
        }

        return registerResponseBody;
    }


    private FastFedStartMetadataResponse retrieveIdPMetadata(String fastFedMetadataUrl) throws Exception {
        LOG.debug("retrieveIdPMetadata called. Type: %s");

        FastFedSdkPropertiesObject fastFedSdkProperties = getFastFedSdkProperties();
        FastFedStartMetadataResponse metadata = new FastFedStartMetadataResponse();

        try {
            JSONObject metadataObject = getFastFedProviderMetadata(fastFedMetadataUrl, Constants.IDENTITY_PROVIDER);
            if (metadataObject == null) {
                throw new Exception(String.format("Retrieved invalid FastFed metadata from FastFed endpoint: %s", fastFedMetadataUrl));
            }

            verifyCompatibility(metadataObject);

            WhitelistRecord whitelistRecord = toWhiteListRecord(metadataObject);
            whitelistProvider.add(whitelistRecord);

            String startUrl = metadataObject.get(Constants.FASTFED_HANDSHAKE_START_URI).toString()
                    + "?app_metadata_uri=" + fastFedSdkProperties.getAppFastfedEndpoint();

            if (fastFedSdkProperties.getWhitelisting().isEnabled()) {
                // default to 1 day if not specified
                int seconds = ObjectUtils.defaultIfNull(
                        fastFedSdkProperties.getWhitelisting().getExpirationMinutes(), 24 * 60) * 60;
                startUrl += "&expiration=" + (new Date().getTime() + seconds);

                metadata.setStartUrl(startUrl);
            }
        } catch (Exception ex) {
            metadata.setError(true);
            metadata.setMessage(ex.toString());
        }

        return metadata;
    }

    /**
     * Posts signed JWT with the provider specific payload to the application provider specified FastFed registration URL
     *
     * @param applicationProviderMetadataObj the application provider's metadata
     */
    private JSONObject postFastFedHandshakeRegisterMetadata(JSONObject applicationProviderMetadataObj) throws
            Exception {

        LOG.debug("postFastFedHandshakeRegisterMetadata called");
        String handshakeRegisterUrl = applicationProviderMetadataObj.get(Constants.FASTFED_HANDSHAKE_REGISTER_URI).toString();
        String entityId = applicationProviderMetadataObj.get(Constants.ENTITY_ID).toString();

        LOG.debug("handshake register url: " + handshakeRegisterUrl);
        LOG.debug("application id: " + entityId);

        String sig = jwksService.getSignedJwtJson(entityId);

        // keep it simple for now.  not using a WebFinger account but can add one at some point
        try (CloseableHttpClient httpClient = HttpClientBuilder.create().build()) {
            HttpPost httpPost = new HttpPost(handshakeRegisterUrl);
            httpPost.setEntity(new StringEntity(sig, ContentType.create("text/plain", "UTF-8")));

            httpPost.setHeader("Accept", "application/json");

            try (CloseableHttpResponse httpResponse = httpClient.execute(httpPost)) {
                HttpEntity entity = httpResponse.getEntity();
                if (entity == null) {
                    throw new Exception("There was no information returned in the registration response.");
                }

                // TODO:  handle other status codes per the spec
                int statusCode = httpResponse.getStatusLine().getStatusCode();
                if (statusCode != 200) {
                    throw new Exception("An invalid response status was obtained from the application provider: " +
                            statusCode);
                }

                String response = EntityUtils.toString(entity);
                JSONObject responseJSONObj = (JSONObject) new JSONParser().parse(response);

                LOG.debug("response received from register endpoint: " + responseJSONObj.toJSONString());
                return responseJSONObj;
            } catch (ParseException pe) {
                LOG.error("Unable to parse the register endpoints JSON response: " + pe.getMessage());
                throw new Exception(pe);
            } catch (Exception ex) {
                LOG.error("Unable to post to register endpoint: " + ex.getMessage());
                throw ex;
            }
        }
    }

    private WhitelistRecord toWhiteListRecord(JSONObject metadataObject) {

        WhitelistRecord record = new WhitelistRecord();

        record.setEntityId(metadataObject.get(Constants.ENTITY_ID).toString());
        record.setDomain(metadataObject.get(Constants.PROVIDER_DOMAIN).toString());
        record.setJwksUri(metadataObject.get(Constants.JWKS_URI).toString());
        record.setFastfedMetadataJson(metadataObject.toJSONString());

        return record;
    }

    private WhitelistRecord toWhiteListRecord(DecodedJWT jwt) throws org.json.simple.parser.ParseException {

        WhitelistRecord record = new WhitelistRecord();

        record.setEntityId(jwt.getClaim(Constants.ENTITY_ID).asString());
        record.setDomain(jwt.getIssuer());
        record.setJwksUri(jwt.getClaim(Constants.JWKS_URI).asString());
        record.setFastfedMetadataJson(jwt.getPayload());

        return record;
    }

    private void processRegistrationRequestFromIdP(DecodedJWT jwt, JSONObject providerFastFedMetadata) throws Exception {

        String entityId = jwt.getClaim(Constants.ENTITY_ID).asString();

        // For now, only SAML is supported.  In the future, can have more options based on the available FastFed authentication profiles
        JSONObject samlMetadata = getSAMLMetadataJSONObject(parseJson(jwt.getPayload()));
        if (samlMetadata != null) {
            FastFedAuthenticationObject samlAuthObject = getSAMLAuthenticationObject(
                    entityId, samlMetadata, providerFastFedMetadata);

            if (samlAuthObject != null) {
                this.appProvider.addAuthenticationApplication(samlAuthObject);
            }
        } else {
            LOG.debug("There is no authentication claim in the FastFed JWT. Skipping FastFed authentication process.");
        }

        // For now, only SCIM is supported.  In the future, can have more options based on the available FastFed provisioning profiles
        JSONObject scimMetadata = getSCIMMetadataJSONObject(parseJson(jwt.getPayload()));
        if (scimMetadata != null) {
            FastFedProvisioningObject scimProvisiongObject =
                    getSCIMProvisioningObject(entityId, scimMetadata, providerFastFedMetadata);

            if (scimProvisiongObject != null) {
                this.appProvider.addProvisioningApplication(scimProvisiongObject);
            }
        } else {
            LOG.debug("There is noo SCIM provisioning claim in the FastFed JWT. Skipping FastFed provisioning process.");
        }
    }

    private FastFedAuthenticationObject getSAMLAuthenticationObject(String entityId,
                                                                    JSONObject samlMetadata,
                                                                    JSONObject providerFastFedMetadata) throws Exception {

        FastFedAuthenticationObject authObject = null;

        if (samlMetadata == null) {
            throw new Exception("Unable to retrieve SAML object value from FastFed metadata");
        }

        String idpSamlMetadataUrl = samlMetadata.get(Constants.SAML_METATADATA_URI).toString();

        if (idpSamlMetadataUrl == null) {
            LOG.debug("Didn't find a SAML metadata url. No SSO to setup.");
        } else {
            LOG.debug("Found a SAML metadata url: " + idpSamlMetadataUrl);

            authObject = new FastFedAuthenticationObject(
                    entityId,
                    idpSamlMetadataUrl,
                    providerFastFedMetadata
            );
        }

        return authObject;
    }


    private FastFedProvisioningObject getSCIMProvisioningObject(String entityId,
                                                                JSONObject scimMetadata,
                                                                JSONObject providerFastFedMetadata)
            throws Exception {

        FastFedProvisioningObject result = null;

        if (scimMetadata == null) {
            throw new Exception("Invalid SCIM object metadata.");
        }

        String providerEndpointUrl = scimMetadata.get(Constants.SCIM_SERVICE_URI).toString();
        String providerAuthMethod = scimMetadata.get(Constants.PROVIDER_AUTHENTICATION_METHODS).toString();

        // the actual metadata object for the provider authentication method specified in the metadata, ie,
        // the actual "urn:ietf:params:fastfed:1.0:provider_authentication:OAuth-2.0:JWTProfile" object
        // For now, this is all we support
        JSONObject providerAuthMethodObj = (JSONObject) scimMetadata.get(providerAuthMethod);
        if (providerAuthMethodObj == null) {
            LOG.debug("Didn't find a '" + Constants.PROVIDER_AUTHENTICATION_METHODS + "' object.  No provisioning to setup");
        } else {
            LOG.debug("Found a '" + Constants.PROVIDER_AUTHENTICATION_METHODS + "' object.  Setting up provisioning.");

            result = new FastFedProvisioningObject(
                    entityId,
                    providerEndpointUrl,
                    providerAuthMethodObj.get(Constants.TOKEN_ENDPOINT).toString(),
                    providerAuthMethodObj.get(Constants.SCOPE).toString(),
                    providerFastFedMetadata
            );
        }

        return result;
    }

    /**
     * Validates and decodes a JWT token
     *
     * @param token an undecoded, signed JWT token
     * @return DecodedJWT object
     * @throws WhitelistedException
     * @throws JWTVerificationException
     * @throws JwkException
     * @throws MalformedURLException
     */
    private JWTVerifyResult verifyJwt(String token) throws WhitelistedException, JWTVerificationException,
            JwkException, MalformedURLException, JsonProcessingException {

        LOG.debug("Entered decodeJwt");

        DecodedJWT decodedJWT = JWT.decode(token);
        String domain = decodedJWT.getIssuer();
        String aud = decodedJWT.getAudience().get(0);
        String entityId = decodedJWT.getClaim(Constants.ENTITY_ID).asString();
        String kid = decodedJWT.getKeyId();

        WhitelistRecord whitelistRecord = whitelistProvider.get(entityId);
        if (whitelistRecord == null) {
            LOG.error("Entity id: " + entityId + " was not whitelisted to perform FastFed handshake process");
            throw new WhitelistedException("The provider specified was not whitelisted to perform the FastFed handshake process");
        }

        LOG.debug("retrieved whitelisted provider information: " +
                new ObjectMapper().writeValueAsString(whitelistRecord));

        // TODO:  pick one!  Auth0 lib or JOSE+JWT (using both currently in different places)

        // use URL so the auto0 lib won't add .well-known endpoint on to it
        JwkProvider provider = new UrlJwkProvider(new URL(whitelistRecord.getJwksUri()));
        Jwk jwk = provider.get(kid);

        // don't accept expired tokens.  the provider is responsible for setting when the token expires and
        // should compensate for clock skew.  See FastFed spec section 6.4
        Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
        JWTVerifier verifier = JWT.require(algorithm)
                .withIssuer(domain)
                .withAudience(aud)
                .withClaim(Constants.ENTITY_ID, entityId)
                .acceptExpiresAt(0)
                .build();

        DecodedJWT jwt = verifier.verify(token);

        return new JWTVerifyResult(jwt, whitelistRecord);
    }


    /**
     * Gets this application's FastFed metadata
     *
     * @return this application provider's FastFed metadata
     */
    public JSONObject getMetadata() throws ParseException {

        JSONObject metadata = new JSONObject();
        if (this.appProvider != null) {
            JSONObject appMetadata = parseJson(this.appProvider.getMetadata());
            metadata.putAll(appMetadata);
        }

        if (this.idpProvider != null) {
            JSONObject idpMetadata = parseJson(this.idpProvider.getMetadata());
            metadata.putAll(idpMetadata);
        }

        return metadata;
    }

    /**
     * Performs a compatibility check between the provider's and this application's FastFed metadata
     * to make sure that they have the commonalities required to perform a successful handshake
     *
     * @param idpMetadataObj the FastFed metadata for the idp
     * @throws CompatibilityException
     */
    public void verifyCompatibility(JSONObject idpMetadataObj) throws CompatibilityException {
        LOG.debug("entered verifyCompatibility");
        try {

            JSONObject capabilities = (JSONObject) idpMetadataObj.get(Constants.CAPABILITIES);

            // intersect the app and provider metadata to make sure they are compatible

            JSONObject appProviderObj = (JSONObject) getMetadata().get(Constants.APPLICATION_PROVIDER);
            JSONObject appCapabilities = (JSONObject) appProviderObj.get(Constants.CAPABILITIES);

            // intersection of keys to determine where app and provider have same capabilities
            appCapabilities.keySet().retainAll(capabilities.keySet());

            // intersect the array values now
            for (Object keyObj : appCapabilities.keySet()) {
                String key = keyObj.toString();
                Object appProvVal = appCapabilities.get(key);
                Object capability = capabilities.get(key);
                if (appProvVal instanceof JSONArray && capability instanceof JSONArray) {
                    JSONArray appProvJsonArray = (JSONArray) appProvVal;
                    JSONArray provArray = (JSONArray) capability;
                    JSONArray intersection = new JSONArray();

                    appProvJsonArray
                            .stream()
                            .map(str -> (String) str)
                            .filter(provArray::contains)
                            .distinct()
                            .forEach(str -> intersection.add(str));

                    appCapabilities.put(key, intersection);
                }
            }

            // check to see if the required capabilities have an intersection
            JSONArray signingAlgsSupported =
                    (JSONArray) appCapabilities.getOrDefault(Constants.SIGNING_ALG_VALUES_SUPPORTED, new JSONArray());
            JSONArray schemas =
                    (JSONArray) appCapabilities.getOrDefault(Constants.SCHEMA_GRAMMARS, new JSONArray());
            JSONArray authProfiles =
                    (JSONArray) appCapabilities.getOrDefault(Constants.AUTHENTICATION_PROFILES, new JSONArray());
            JSONArray provProfiles =
                    (JSONArray) appCapabilities.getOrDefault(Constants.PROVISIONING_PROFILES, new JSONArray());

            // valid if at least one auth profile or provisioning profile
            boolean isValid = (
                    (authProfiles != null && authProfiles.size() > 0) || (provProfiles != null && provProfiles.size() > 0)
            );

            if (!isValid || signingAlgsSupported.size() == 0 || schemas.size() == 0) {
                throw new Exception("The Provider and Application are not FastFed compatible.");
            }

        } catch (Exception e) {
            throw new CompatibilityException(e);
        }
    }

    /**
     * Retrieves the provider's FastFed metadata from the server
     *
     * @param fastFedMetadataUrl
     * @return
     * @throws Exception
     */
    private JSONObject getFastFedProviderMetadata(String fastFedMetadataUrl, String key) throws Exception {
        LOG.debug("entered getFastFedProviderMetadata");
        JSONObject metadataObject = null;

        // keep it simple for now.  not using a WebFinger account but can add one at some point
        try (CloseableHttpClient httpClient = HttpClientBuilder.create().build()) {

            HttpGet httpGet = new HttpGet(fastFedMetadataUrl);

            try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
                String fastFedMetadataJson = EntityUtils.toString(response.getEntity());
                JSONObject fastFedMetadataObject = (JSONObject) new JSONParser().parse(fastFedMetadataJson);
                if (fastFedMetadataObject == null || !fastFedMetadataObject.containsKey(key)) {
                    throw new Exception("Unable to locate '" + key + "' key in FastFed metadata.");
                }

                metadataObject = (JSONObject) fastFedMetadataObject.get(key);
            }

        }

        return metadataObject;
    }

    /**
     * Initialize the service by obtaining the fastfed metadata through WebFinger discovery
     */
    @SuppressWarnings("unchecked")
    private String getFastfedMetadataUrl(String account) throws ParseException {

        LOG.debug("getFastfedMetadataUrl called");

        String fastfedMetadataUrl = null;

        String webFingerUrl = getFastFedSdkProperties().getWebFingerUrl();
        LOG.debug("webFingerUrl: " + webFingerUrl);

        JSONObject webFingerMetadata = webFingerService.getWebFingerMetadata(account, webFingerUrl);
        if (webFingerMetadata != null) {

            // For now, assume webfinger server is real and that we'd get a unique subject back
            JSONArray links = (JSONArray) webFingerMetadata.get("links");

            JSONObject link = (JSONObject) links
                    .stream()
                    //.map(obj -> (JSONObject)obj)
                    .filter(o -> ((JSONObject) o).get("rel").equals("http://openid.net/specs/fastfed/1.0/provider"))
                    .findFirst()
                    .orElse(null);


            if (link != null) {
                fastfedMetadataUrl = link.get("href").toString();
                LOG.debug("fastfedMetadataUrl: " + fastfedMetadataUrl);
            }
        }

        return fastfedMetadataUrl;
    }

    /**
     * Retrieves the application provider's SAML endpoint URL from it's supplied FastFed metadata
     *
     * @param providerMetadataObj the application provider's FastFed metadata
     */
    private JSONObject getSAMLMetadataJSONObject(JSONObject providerMetadataObj) {

        // TODO:
        // right now, we only support SAML authentication profile but this should come from
        // whatever common capability we decided to use
        JSONObject metadata = (JSONObject) providerMetadataObj
                .get(Constants.URN_IETF_PARAMS_FASTFED_1_0_AUTHENTICATION_SAML_BASIC);

        if (metadata == null) {
            LOG.error("Unable to obtain FastFed SAML metadata from the application provider");
        } else {
            LOG.debug("Found saml metadata: " + Constants.URN_IETF_PARAMS_FASTFED_1_0_AUTHENTICATION_SAML_BASIC);
        }

        return metadata;
    }

    /**
     * Retrieves the application provider's SCIM endpoint URL from it's supplied FastFed metadata
     *
     * @param providerMetadataObj the provider's FastFed metadata
     */
    private JSONObject getSCIMMetadataJSONObject(JSONObject providerMetadataObj) {

        // TODO:
        // right now, we only support SCIM provisioning profile but this should come from
        // whatever common capability we decided to use
        JSONObject metadata = (JSONObject) providerMetadataObj
                .get(Constants.URN_IETF_PARAMS_FASTFED_1_0_PROVISIONING_SCIM_FULL_LIFE_CYCLE);

        if (metadata == null) {
            LOG.error("Unable to obtain FastFed SCIM metadata from the application provider");
        } else {
            LOG.debug("Found SCIM metadata: " + Constants.URN_IETF_PARAMS_FASTFED_1_0_PROVISIONING_SCIM_FULL_LIFE_CYCLE);
        }

        return metadata;
    }


    /*
    Get the FastFed finalize URL from the application provider's FastFed metadata
     */
    private String getApplicationProviderFinalizeUrl(JSONObject appProviderMetadata) {
        String uri = null;

        if (appProviderMetadata != null) {

            try {
                uri = appProviderMetadata.get(Constants.FASTFED_FINALIZE_REGISTER_URI).toString();
            } catch (Exception e) {
                LOG.debug("Unable to obtain finalize registration endpoint. This is optional and can be ignored unless it is expected.");
            }
        }

        return uri;
    }

    /*
   Get the FastFed finalize URL from the application provider's FastFed metadata
    */
    private String getApplicationProviderJwksUri(JSONObject appProviderMetadata) {
        String uri = null;

        if (appProviderMetadata != null) {

            try {
                uri = appProviderMetadata.get(Constants.JWKS_URI).toString();
            } catch (Exception e) {
                LOG.error("Unable to obtain JWKS_URI endpoint in application provider's metadata.");
                throw e;
            }
        }

        return uri;
    }

    /**
     * Process the application provider's SCIM and SAML metadata from its registration response.
     * This method takes the provisioning metadata the IdP retrieved from the application provider and process it
     * TODO: basic functionality between IdP and App provider parsing this data is the same.  Combine and pass
     * in the appropriate provider instance (idpProvider or appProvider)
     */
    private void processApplicationProviderRegistrationResponse(String entityId,
                                                                JSONObject registerResponseMetadata,
                                                                JSONObject providerFastFedMetadata)
            throws Exception {

        JSONObject samlMetadataObj = getSAMLMetadataJSONObject(registerResponseMetadata);
        if (samlMetadataObj != null) {
            FastFedAuthenticationObject authObj = getSAMLAuthenticationObject(
                    entityId, samlMetadataObj, providerFastFedMetadata);

            this.idpProvider.addAuthenticationApplication(authObj);
        }

        JSONObject scimMetadataObj = getSCIMMetadataJSONObject(registerResponseMetadata);
        if (scimMetadataObj != null) {
            FastFedProvisioningObject provisioningObj = getSCIMProvisioningObject(
                    entityId, scimMetadataObj, providerFastFedMetadata);

            this.idpProvider.addProvisioningApplication(provisioningObj);
        }
    }


    /**
     * Perform the FastFed finalize step
     *
     * @param entityId                 the entityid of the application provider
     * @param registerResponseMetadata the registration response from the application server's /register endpoint
     * @return JSONObject of the response or null if there is no finalize step to do
     */
    private void postFastFedFinalize(String entityId,
                                     JSONObject registerResponseMetadata) throws Exception {

        LOG.debug("calling fastfed application finalize endpoint");

        String sig = this.jwksService.getSignedJwtJson(entityId);
        LOG.debug("finalize payload: " + sig);

        // send the finalize to the application provider
        String finalizeUrl = this.getApplicationProviderFinalizeUrl(registerResponseMetadata);
        LOG.debug("finalize url: " + finalizeUrl);

        // optional.  if not there, do nothing
        if (finalizeUrl != null) {

            try (CloseableHttpClient httpClient = HttpClientBuilder.create().build()) {
                HttpPost httpPost = new HttpPost(finalizeUrl);
                httpPost.setEntity(new StringEntity(sig));

                try (CloseableHttpResponse httpResponse = httpClient.execute(httpPost)) {
                    HttpEntity entity = httpResponse.getEntity();
                    if (entity == null) {
                        throw new Exception("There was no information returned in the finalization response.");
                    }

                    // TODO:  handle other status codes per the spec
                    int statusCode = httpResponse.getStatusLine().getStatusCode();
                    if (statusCode != 200) {
                        throw new Exception("An invalid finalization response status was obtained from the application provider: " +
                                statusCode);
                    }

                    LOG.debug("response received status code from finalize endpoint: " + statusCode);
                }
            }
        }
    }
}
