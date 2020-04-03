package com.sailpoint.fastfed.sdk.services;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.json.simple.JSONObject;

import java.io.IOException;


public class WebFingerSdkService extends SdkServiceBase {

    private static final Logger LOG = LoggerFactory
            .getLogger(WebFingerSdkService.class);

    public WebFingerSdkService() throws Exception {
        super();
    }

    /**
     * Gets WebFinger metadata for a specific account
     *
     * @param account the email address of the WebFinger entity
     * @param webFingerUrl well-known endpoint for the WebFinger metadata
     * @return
     * @throws ParseException
     */
    public JSONObject getWebFingerMetadata(String account, String webFingerUrl) throws ParseException {
        LOG.debug("entered getWebFingerMetadata");

        JSONObject webFingerObject = null;

        // keep it simple for now.  not using a WebFinger account but can add one at some point
        try (CloseableHttpClient httpClient = HttpClientBuilder.create().build()) {

            HttpGet httpGet = new HttpGet(webFingerUrl);

            try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
                String webFingerMetadataJson = EntityUtils.toString(response.getEntity());

                Object parsedObject = new JSONParser().parse(webFingerMetadataJson);
                webFingerObject = (JSONObject)parsedObject;
            }

        } catch (IOException e) {
            LOG.error("Unable to retrieve the webfinger metadata");
        }

        return webFingerObject;
    }

}
