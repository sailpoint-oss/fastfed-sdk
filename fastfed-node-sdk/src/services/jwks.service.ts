import jose, {JWT} from 'jose';
import JwksClient from "jwks-rsa";
import LOG from '../logger';
import {IJwksProvider, JWTRequest} from '..';
import {ConfigurationService} from "./configuration.service";
import completeResult = JWT.completeResult;

/*
Service for JWKS related functionality.
 */

export class JwksService {

    private static readonly HOURS_MS: number = 1000 * 60 * 60;

    constructor(private jwksProvider: IJwksProvider) {

    }

    /**
     * Get the JWKS keys for this server.
     * This will allow this application to sign JWT with our private key and external resources to
     * use this JWKS metadata to verify the signature
     */
    public get() {
        return this.jwksProvider.getMetadata();
    }

    /**
     * Get the private key for a specific kid from this server
     */
    public getPrivateKey(kid: string): string {
        return this.jwksProvider.getJwksPrivateKey(kid);
    }

    /**
     * Build the signed JWT for a specific provider
     * @return the signed JWT as a string
     * @param request payload and header to sign
     */
    public getSignedJwtJson(request: JWTRequest): string {

        const expirationMinutes = ConfigurationService.getJwtTokenExpirationMinutes();

        const payload: any = (request.payload as any);
        const header: any = (request.header as any);

        if (!header.kid) {
            throw new Error("There is no kid specified in the Jwt header");
        }
        const jwksPrivateKey: string = this.getPrivateKey(header.kid);

        return jose.JWT.sign(
            payload,
            JSON.parse(jwksPrivateKey),
            {
                header: header,
            }
        );
    }

    /**
     * Verify a JWT is valid and signed properly
     * @param token the signed JWT
     * @param jwksUri
     * @returns a promise with a JWTVerifyResult
     */
    public async verifySignedJwt(token: string, jwksUri: string): Promise<completeResult> {
        if (!token) {
            throw new Error("Token is not valid");
        }

        const decodedJwt = jose.JWT.decode(token, {complete: true});
        const header: any = decodedJwt.header;
        const payload: any = decodedJwt.payload;

        const aud = payload.aud;
        if (aud !== ConfigurationService.getEntityId()) {
            throw new Error("The aud in the JWT didn't match this application provider's entityid.");
        }

        try {
            const signingKey = await this.getSigningKey(header.kid, jwksUri);
            jose.JWT.verify(token, signingKey);
        } catch (err) {
            LOG.error(err);
            throw err;
        }

        return decodedJwt;
    }

    private async getSigningKey(kid: string, jwksUri: string): Promise<string> {
        const client = JwksClient({
            cache: true,
            rateLimit: true,
            cacheMaxAge: 24 * JwksService.HOURS_MS, // one day cache
            jwksRequestsPerMinute: 10, // Default value
            jwksUri: jwksUri
        });

        return new Promise((resolve, reject) => {
            client.getSigningKey(kid, (err, key: any) => {
                if (err) {
                    return reject(err);
                }

                resolve(key.publicKey || key.rsaPublicKey);
            });
        });
    }

}

