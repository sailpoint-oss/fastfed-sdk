package com.sailpoint.fastfed.sdk.model;

import com.auth0.jwt.interfaces.DecodedJWT;

/**
 * Class that represents the results of verifying a JWT
 */
public class JWTVerifyResult {
    private DecodedJWT jwt;
    private WhitelistRecord whitelistRecord;

    public DecodedJWT getJwt() {
        return jwt;
    }

    public WhitelistRecord getWhitelistRecord() {
        return whitelistRecord;
    }

    public JWTVerifyResult(DecodedJWT jwt, WhitelistRecord whitelistRecord) {
        this.jwt = jwt;
        this.whitelistRecord = whitelistRecord;
    }

}
