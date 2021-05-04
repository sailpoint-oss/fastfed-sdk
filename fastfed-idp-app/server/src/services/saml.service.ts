import express, {Application} from 'express';
import fs from 'fs';
import path from 'path';
import passport from 'passport';
import ExpressServer from '../common/server';
import {IdentityProviderInstance} from '../providers/identityProvider.factory';

const app = express();

/*
Service for SAML related functionality.

This is the main class responsible for configuring this application to allow SAML federated logins.
It currently is hard-coded to use Labs ADFS server.
 */
class SamlService {

    private _metadata: string;

    constructor() {
        this._metadata = null;
    }

    /*
    Get the SAML metadata for this application
     */
    get metadata(): string {
        return this._metadata;
    }

    /*
    Initialize the server for SAML federation.
    This FastFed IdP application will federate the user through the Keycloak server as defined in this method.
    Any attempt from an external server to use the FastFed endpoints will force authentication
     */
    public async init() {
        const config = await IdentityProviderInstance.getSamlConfig();


        var SamlStrategy = require('passport-saml').Strategy;
        var SamlStrategyObj = new SamlStrategy(config,
     		      function (profile, done) {
		                   return done(null, profile);
			            });
        passport.use(SamlStrategyObj);
	
        this._metadata = SamlStrategyObj.generateServiceProviderMetadata(null, config.privateCert || null);
     }
}

const SamlServiceInstance = new SamlService();
export default SamlServiceInstance;
