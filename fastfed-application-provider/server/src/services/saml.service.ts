import express from 'express';
import passport from 'passport';
import passportSaml from 'passport-saml';
import {IdentityProviderInstance} from '../providers/keycloak.identity.provider';

const app = express();

/*
Service for SAML related functionality.

This is the main class responsible for configuring this application to allow SAML federated logins.
It currently is hard-coded to use Labs ADFS server.
 */
export class SamlService {

    private _metadata: string;
    private strategy: passportSaml.Strategy;

    constructor() {
        this._metadata = null;
    }

    /*
    Get the SAML metadata for this application
     */
    getMetadata(): string {
        return this._metadata;
    }

    public getPassportStrategy() {
        return this.strategy;
    }

    /*
   Initialize the server for SAML federation.
   This FastFed IdP application will federate the user through the Keycloak server as defined in this method.
   Any attempt from an external server to use the FastFed endpoints will force authentication
    */
    public init(serverRootFolder: string): void {
        const config = IdentityProviderInstance.getSamlConfig(serverRootFolder);

        this.strategy = new passportSaml.Strategy(config,
            function (profile, done) {
                return done(null, profile);
            });

        passport.use('saml', this.strategy);

        this._metadata = this.strategy.generateServiceProviderMetadata(null, config.privateCert || null);
    }
}

const SamlServiceInstance = new SamlService();
export default SamlServiceInstance;
