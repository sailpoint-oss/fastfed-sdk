package com.sailpoint.fastfed.sdk.model;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.junit.Assert.assertNotNull;

/**
 * This SDK library's configuration model
 */
public class FastFedSdkPropertiesObject {
    private static final Logger LOG = LoggerFactory
            .getLogger(FastFedSdkPropertiesObject.class);

    private String entityId = "";
    private String applicationDisplayName = "";
    private String jwtKey = "";
    private String webFingerUrl = "";
    private String appFastfedEndpoint = "";
    private String domain = "localhost";
    private String tenantId = "localhost";
    private String idnApiServer = "";
    private String protocol = "http";
    private String connectionString;
    private Whitelisting whitelisting;
    private Integer jwtExpirationMinutes = null;
    private ProviderIdentity providerIdentity;

    public FastFedSdkPropertiesObject() {
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }


    public String getApplicationDisplayName() {
        return applicationDisplayName;
    }

    public void setApplicationDisplayName(String applicationDisplayName) {
        this.applicationDisplayName = applicationDisplayName;
    }

    public String getJwtKey() {
        return jwtKey;
    }

    public void setJwtKey(String jwtKey) {
        this.jwtKey = jwtKey;
    }

    public String getWebFingerUrl() {
        return webFingerUrl;
    }

    public void setWebFingerUrl(String webFingerUrl) {
        this.webFingerUrl = webFingerUrl;
    }

    public String getAppFastfedEndpoint() {
        return appFastfedEndpoint;
    }

    public void setAppFastfedEndpoint(String appFastfedEndpoint) {
        this.appFastfedEndpoint = appFastfedEndpoint;
    }

    public String getDomain() {
        return domain;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getIdnApiServer() {
        return this.idnApiServer;
    }

    public void setIdnApiServer(String idnApiServer) {
        this.idnApiServer = idnApiServer;
    }

    public String getProtocol() {
        return this.protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public String getConnectionString() {
        return connectionString;
    }

    public void setConnectionString(String connectionString) {
        this.connectionString = connectionString;
    }

    public Whitelisting getWhitelisting() {
        return whitelisting;
    }

    public void setWhitelisting(Whitelisting whitelisting) {
        this.whitelisting = whitelisting;
    }

    public String getAudience() {
        return String.format("%s.%s", this.domain, this.tenantId);
    }

    public Integer getJwtExpirationMinutes() {
        if (this.jwtExpirationMinutes == null) {
            this.jwtExpirationMinutes = 10;
        }

        return this.jwtExpirationMinutes;
    }

    public void setJwtExpirationMinutes(Integer jwtExpirationMinutes) {
        this.jwtExpirationMinutes = jwtExpirationMinutes;
    }

    public ProviderIdentity getProviderIdentity() {
        return providerIdentity;
    }

    public void setProviderIdentity(ProviderIdentity providerIdentity) {
        this.providerIdentity = providerIdentity;
    }

    public static class Whitelisting {

        private Boolean enabled;
        private int expirationMinutes;

        public Boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(Boolean enabled) {
            this.enabled = enabled;
        }

        public int getExpirationMinutes() {
            return expirationMinutes;
        }

        public void setExpirationMinutes(int expirationMinutes) {
            this.expirationMinutes = expirationMinutes;
        }
    }

    public static class ProviderIdentity {
        private String jwksUri;
        private String organization;
        private String phone;
        private String email;

        public String getJwksUri() {
            return jwksUri;
        }

        public void setJwksUri(String jwksUri) {
            this.jwksUri = jwksUri;
        }

        public String getOrganization() {
            return organization;
        }

        public void setOrganization(String organization) {
            this.organization = organization;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}
