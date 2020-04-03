import secureRandom from 'secure-random';
import * as FastFedSDK from 'fastfed-node-sdk';
import WhitelistServiceInstance from './whitelist.service';
import LOG from '../common/logger'
import JwksProviderInstance from '../providers/jwks.provider.impl';
import ApplicationsServiceInstance from './applications.service';
import {JWT} from 'jose';

/**
 * Class responsible for the authentication functionality
 */
export class AuthService {

    private static readonly BEARER_TOKEN_EXPIRATION_HOURS_ENV = 'BEARER_TOKEN_EXPIRATION_HOURS';
    private static readonly HOURS_MS: number = 1000 * 60 * 60;

    private jwksService: FastFedSDK.JwksService;

    constructor() {
        this.jwksService = new FastFedSDK.JwksService(JwksProviderInstance);
    }

    /**
     * Get OAuth bearer token from a jwt-bearer grant type
     * @param fastfedProvisioningObject information about the FastFed IdP requiring a bearer token
     */
    public async createBearerToken(fastfedProvisioningObject: FastFedSDK.FastFedProvisioningObject): Promise<string> {

        // TODO: add provisioning_profile information to the FastFedProvisioningObject?
        try {

            let oauth: FastFedSDK.OAuthRecord = null;

            const app: any = ApplicationsServiceInstance.get(fastfedProvisioningObject.entityId);
            if (!app) {
                // generate some quick oauth type record
                oauth = new FastFedSDK.OAuthRecord(
                    secureRandom(32, {type: 'Buffer'}).toString('base64'),
                    AuthService.HOURS_MS * parseInt(process.env[AuthService.BEARER_TOKEN_EXPIRATION_HOURS_ENV] || '6'),
                    'bearer'
                );

                // save it to our registered application store
                ApplicationsServiceInstance.add(fastfedProvisioningObject.entityId, oauth);
            } else {
                oauth = app.oauth;
            }

            // return the bearer token
            return oauth.toJson();

        } catch (err) {
            LOG.error(err);
            throw err;
        }
    }

    /**
     * Get the bearer token for an IdP from a JWT
     * @param signedJwt a signed jwt from a client application
     */
    public async getOAuthRecord(signedJwt: string): Promise<FastFedSDK.OAuthRecord> {

        try {

            // decode the JWT and make sure it is whitelisted and then verify it
            const decodedJwt = JWT.decode(signedJwt, {complete: true});
            const whitelistRecord: FastFedSDK.WhitelistRecord = WhitelistServiceInstance.get(decodedJwt.payload['iss']);

            const jwt = await this.jwksService.verifySignedJwt(signedJwt, whitelistRecord.getIdentityProviderJwksUri());

            // get the registered application from the applications list
            const appRecord: any = ApplicationsServiceInstance.get(jwt.payload['iss']);

            return appRecord.oauth;

        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
