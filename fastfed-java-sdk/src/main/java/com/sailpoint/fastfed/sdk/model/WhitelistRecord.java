package com.sailpoint.fastfed.sdk.model;

/**
 * POJO for information about a whitelisted IdP
 */
public class WhitelistRecord {
    private String entityId;
    private String domain;
    private String jwksUri;
    private String fastfedMetadataJson;
    private Boolean isSuccess;
    private Boolean isCompleted;
    private String errorMessage;

    private OAuthRecord oAuthRecord;

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public Boolean getSuccess() {
        return isSuccess;
    }

    public void setSuccess(Boolean success) {
        isSuccess = success;
    }

    public Boolean getCompleted() {
        return isCompleted;
    }

    public void setCompleted(Boolean completed) {
        isCompleted = completed;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getJwksUri() {
        return jwksUri;
    }

    public void setJwksUri(String jwksUri) {
        this.jwksUri = jwksUri;
    }

    public String getFastfedMetadataJson() {
        return fastfedMetadataJson;
    }

    public void setFastfedMetadataJson(String fastfedMetadataJson) {
        this.fastfedMetadataJson = fastfedMetadataJson;
    }

    public OAuthRecord getoAuthRecord() {
        return oAuthRecord;
    }

    public void setoAuthRecord(OAuthRecord oAuthRecord) {
        this.oAuthRecord = oAuthRecord;
    }


}
