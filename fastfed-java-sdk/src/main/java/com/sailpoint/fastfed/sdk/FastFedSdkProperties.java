package com.sailpoint.fastfed.sdk;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;
import com.sailpoint.fastfed.sdk.model.FastFedSdkPropertiesObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * This application's configuration
 */
public class FastFedSdkProperties {

    private static final Logger LOG = LoggerFactory
            .getLogger(FastFedSdkProperties.class);

    private static FastFedSdkProperties instance = null;
    private FastFedSdkPropertiesObject properties;

    protected FastFedSdkProperties() throws Exception {
        loadProperties();
    }

    public synchronized static FastFedSdkProperties getInstance() {
        if(instance == null) {
            try {
                instance = new FastFedSdkProperties();
            } catch (Exception ex) {
                LOG.error("Error loading SDK properties: " + ex.getMessage());
            }
        }
        return instance;
    }

    public FastFedSdkPropertiesObject getProperties() {
        return this.properties;
    }

    protected void loadProperties() throws Exception {

        // Quick and dirty property loading for now.
        // TODO:  make more robust, move to loader class or something
        // TODO:  check if path is specified in env variable
        try {

            Yaml yaml = new Yaml(new Constructor(FastFedSdkPropertiesObject.class));
            InputStream yamlStream;

            File f = new File("./config/fastfed-sdk-config.yml");
            if (f.exists()) {
                yamlStream = new FileInputStream(f);
                LOG.debug("Using sdk configuration yml file: " + f.getAbsolutePath());
            } else {
                yamlStream = this.getClass().getClassLoader().getResourceAsStream("fastfed-sdk-config.yml");
                LOG.debug("Using sdk configuration fastfed-sdk-config.yml file from resources");
            }

            this.properties = yaml.load(yamlStream);

            validate();
        } catch (Exception ex) {
            LOG.error("Unable to load FastFed properties from /config/fastfed-sdk-config.yml");
            throw ex;
        }
    }

    protected void validate() throws Exception {
        LOG.debug("entered validate");

        // TODO: do assertions
        assertNotNull(this.properties);
        assertNotNull(this.properties.getJwtExpirationMinutes());
        assertTrue(this.properties.getJwtExpirationMinutes() > 0);

        String connStr = properties.getConnectionString();
        if (connStr == null || connStr.isEmpty()) {
            String err = "There is no connection string specified in the configuration.";
            LOG.error(err);
            throw new Exception(err);
        }
    }
}

