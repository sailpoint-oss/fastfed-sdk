package com.sailpoint.fastfed.sdk.services;

import com.sailpoint.fastfed.sdk.FastFedSdkProperties;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.sailpoint.fastfed.sdk.model.FastFedSdkPropertiesObject;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import static org.junit.Assert.assertNotNull;

public class SdkServiceBase {

    private static final Logger LOG = LoggerFactory
            .getLogger(SdkServiceBase.class);

    private final JSONParser parser;

    public SdkServiceBase() throws Exception {
        parser = new JSONParser();
    }


    public static String getCurrentDateTime() {
        return ZonedDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_INSTANT);
    }

    protected FastFedSdkPropertiesObject getFastFedSdkProperties()  {
        return FastFedSdkProperties.getInstance().getProperties();
    }

    protected String getProtocol() {
        return getFastFedSdkProperties().getProtocol();
    }

    /**
     * Build a url with the appropriate protocol
     */
    protected String getUrlWithProtocol(String url) {
        return this.getProtocol() + "://" + url;
    }

    /**
     * Build a url with the appropriate protocol
     */
    protected String getUrlWithProtocol(String tenantId, String domain) {
        return String.format("%s://%s.%s", this.getProtocol(), tenantId, domain);
    }

    protected JSONObject parseJson(String json) throws ParseException {
        return (JSONObject) parser.parse(json);
    }
}
