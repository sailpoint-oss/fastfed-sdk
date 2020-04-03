package com.sailpoint.fastfed.sdk.model;

public class OAuthRecord {


    private String accessToken;
    private long expiresIn;
    private String tokenType;


    public String getAccessToken() {
        return accessToken;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public String getTokenType() {
        return tokenType;
    }

    public OAuthRecord(String accessToken, long expiresIn, String tokenType) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.tokenType = tokenType;
    }

    /**
     * Convert to a FastFed/OAuth standard JSON
     */
    public String toJsonString()  {
        return "{\n" +
                "   \"access_token\": this.accessToken,\n" +
                "   \"expires_in\" : this.expiresIn, \n" +
                "   \"token_type\" : this.tokenType\n" +
                "}";
    }
}
