import * as FastFedSDK from 'fastfed-node-sdk';
import path from 'path';
import fs from 'fs';
import request from 'request-promise-native';
import Utils from '../common/utils';
import LOG from '../common/logger';

export class KeycloakIdentityProvider implements FastFedSDK.IIdentityProvider {

    private keycloakBaseUrl: string;
    private keycloakAdminBaseEndpointUrl: string;
    private keycloakBaseEndpointUrl: string;
    private keycloakRealm: string;
    private accessToken: string;
    private keycloakRealmCertificate: string;

    constructor() {
        this.keycloakRealm = process.env.KEYCLOAK_REALM;
        this.keycloakBaseUrl = `${process.env.IDP_ENDPOINT_BASE}/auth`;
        this.keycloakAdminBaseEndpointUrl = `${this.keycloakBaseUrl}/admin/realms/${this.keycloakRealm}`;
        this.keycloakBaseEndpointUrl = `${this.keycloakBaseUrl}/realms/${this.keycloakRealm}`;
    }

    public async getSamlConfig() {
        const certsFolder = 'saml.certs';

        try {
            this.keycloakRealmCertificate = await this.getCertificate();
            if (!this.keycloakRealmCertificate) {
                LOG.warn('Unable to retrieve Saml certificate from keycloak server.  ' +
                    'Using /saml.certs/keycloak.cer as the certificate. ' +
                    'This will not match the created KeyCloak server initially.  ' +
                    'You will need to manually update this file with the server\'s ' + '' +
                    'master realm certificate.');

                this.keycloakRealmCertificate = fs.readFileSync(path.join(certsFolder, 'keycloak.cer'), 'utf-8');
            }
        } catch (err) {
            LOG.error(err);
            throw err;
        }

        const defaultServer = `http://${Utils.getDomain()}`;
        const localServerBase = `${process.env.FASTFED_APP_SERVER || defaultServer}`;
        const config: any = {
            entryPoint: `${this.keycloakBaseEndpointUrl}/protocol/saml`,
            logoutCallbackUrl: `${localServerBase}/saml/logout`,
            issuer: 'urn:fastfed:keycloak:demo:idp',
            host: localServerBase,
            path: `/saml/login`,
            signatureAlgorithm: 'sha256',
            // authnRequestBinding: 'HTTP-POST',
            identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            cert: this.keycloakRealmCertificate
        };

        return config;
    }

    // TODO: post POC, make the logo urls configurable
    public getMetadata(): any {
        const serverBase = process.env.IDP_SERVER || Utils.getDomain();
        const protocol = process.env.PROTOCOL || 'https';
        return {
            identity_provider: {
                entity_id: `${FastFedSDK.ConfigurationService.getEntityId()}`,
                provider_domain: `${serverBase}`,
                provider_contact_information: {
                    organization: 'FastFed IdP Demo Application Inc.',
                    phone: '+1-800-555-5555',
                    email: 'demo@example.com'
                },
                display_settings: {
                    display_name: 'FastFed KeyCloak IdP Demo',
                    logo_uri: 'https://www.example.com/images/logo.png',
                    icon_uri: 'https://www.example.com/images/icon.png',
                    license: 'https://openid.net/intellectual-property/licenses/fastfed/1.0/'
                },
                capabilities: {
                    authentication_profiles: [
                        'urn:ietf:params:fastfed:1.0:authentication:saml:2.0:basic',
                        'urn:ietf:params:fastfed:1.0:authentication:SOME_OTHER_NON_COMPATIBLE_WITH_APP_PROVIDER',
                    ],
                    // provisioning_profiles: [
                    //     "urn:ietf:params:fastfed:1.0:provisioning:SCIM:FullLifeCycle"
                    // ],
                    schema_grammars: [
                        'urn:ietf:params:fastfed:1:0:schemas:scim:2.0'
                    ],
                    signing_alg_values_supported: [
                        'RS256'
                    ]
                },
                jwks_uri: `${FastFedSDK.ConfigurationService.getJwksProtocol()}://${serverBase}/jwks/keys`,
                fastfed_handshake_start_uri: `${protocol}://${serverBase}/fastfed/start`
            }
        };
    }

    /**
     * Add the FastFed provider's authentication information to the IdP
     * @param fastfedAuthenticationObject
     */
    public async addAuthenticationApplication(fastfedAuthenticationObject: FastFedSDK.FastFedAuthenticationObject): Promise<void> {

        // for now, for sample app, just grab a new token every time
        this.accessToken = await this.getBearerToken();

        const keycloakJSON = await this.convertSAMLXmlToKeycloakJSON(fastfedAuthenticationObject);
        await this.importKeycloakJSON(keycloakJSON);
    }

    /**
     *
     Build the signed JWT for a specific iss and aud
     * @param issuerEntityId
     * @param applicationProviderEntityId entity if of the application provider to get the JWT payload and header
     **/
    public getRegistrationRequest(applicationProviderEntityId: string): FastFedSDK.JWTRequest {

        const serverBase = process.env.IDP_SERVER || Utils.getDomain();
        const payload = {
            ...this.getBasePayload(applicationProviderEntityId),
            schema_grammar: FastFedSDK.SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_SCHEMAS_SCIM_2_0,
            authentication_profiles: [
                FastFedSDK.SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_AUTHENTICATION_SAML_2_0_BASIC
            ],
            'urn:ietf:params:fastfed:1.0:authentication:saml:2.0:basic': {
                saml_metatadata_uri: `${process.env.IDP_ENDPOINT_BASE}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/saml/descriptor`,
            }

            // We aren't supporting provisioning for this IDP
            // provisioning_profiles: [
            //     FastFedSDK.SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_PROVISIONING_SAML_2_0_BASIC
            // ],
            // 'urn:ietf:params:fastfed:1.0:provisioning:scim:2.0:basic': {
            //     provider_contact_information: {
            //         organization: 'Example Inc.',
            //         phone: '+1-800-555-6666',
            //         email: 'provisioning@example.com'
            //     },
            //     provider_authentication_methods: {
            //         'urn:ietf:params:fastfed:1.0:provider_authentication:oauth:2.0:jwt_profile': {
            //             jwks_uri: `${FastFedSDK.ConfigurationService.getJwksProtocol()}://${serverBase}/jwks/keys`,
            //         }
            //     }
            // }
        };

        return new FastFedSDK.JWTRequest(payload, this.getJwtHeader(applicationProviderEntityId));
    };

    public getFinalizeRequest(applicationProviderEntityId: string): FastFedSDK.JWTRequest {
        return new FastFedSDK.JWTRequest(this.getBasePayload(applicationProviderEntityId), this.getJwtHeader(applicationProviderEntityId));
    }

    private getBasePayload(applicationProviderEntityId: string): object {
        const expirationSeconds = FastFedSDK.ConfigurationService.getJwtTokenExpirationMinutes() * 60;
        const exp = Math.floor((Date.now() / 1000)) + expirationSeconds;

        return {
            iss: `${FastFedSDK.ConfigurationService.getEntityId()}`,
            aud: `${applicationProviderEntityId}`,
            exp: exp,
        };
    }

    /**
     * Get a FastFed Jwt JSON object header
     * @param applicationProviderEntityId recipient entityId
     */
    private getJwtHeader(applicationProviderEntityId): object {
        // TODO: we can do a lookup here.  if not found, we can either use the default, create one, or throw an exception

        // for now, we only support RS256 and a default kid so no need to do anything with the iss/aud
        // at some point, if we want different keys for different applications, this will allow us to do that
        // and look up the kid and alg to use for that app (applicationName)
        return {
            alg: 'RS256',
            kid: 'default'
        };

    }

    private async getBearerToken(): Promise<string> {

        const endpointUrl = `${this.keycloakBaseEndpointUrl}/protocol/openid-connect/token`;

        const response = await request({
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            json: true,
            url: endpointUrl,
            form: {
                'username': 'admin',
                'password': 'admin',
                'grant_type': 'password',
                'client_id': 'admin-cli'
            }
        });

        return response.access_token;
    }

    private async convertSAMLXmlToKeycloakJSON(fastfedAuthenticationObject: FastFedSDK.FastFedAuthenticationObject): Promise<string> {
        const keycloakConverterEndpoint =
            `${this.keycloakAdminBaseEndpointUrl}/client-description-converter`;

        return await request({
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Authorization': `Bearer ${this.accessToken}`
            },
            url: keycloakConverterEndpoint,
            body: fastfedAuthenticationObject.getAuthEndpointResponseBody()
        });
    }

    private async importKeycloakJSON(json: string) {

        const keycloakClientCreateEndpoint =
            `${this.keycloakAdminBaseEndpointUrl}/clients`;

        const response = await request({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`
            },
            url: keycloakClientCreateEndpoint,
            body: json
        });

        LOG.debug(response);
    }

    /**
     * Remove the FastFed provider's authentication information to the IdP
     * @param entityId
     */
    public async removeAuthenticationApplication(entityId: string): Promise<void> {
    }


    public async addProvisioningApplication(fastFedProvisioningObject: FastFedSDK.FastFedProvisioningObject): Promise<void> {
    }

    public async removeProvisioningApplication(entityId: string): Promise<void> {
    }

    /**
     * Perform a duplicate check for the application provider against this IdP
     * @param providerMetadata
     */
    public async getDuplicateCheckResult(providerMetadata: object): Promise<FastFedSDK.DuplicateCheckResult> {
        return new FastFedSDK.DuplicateCheckResult(await this.isDuplicateKeycloakClient(providerMetadata), false);
    }

    private async isDuplicateKeycloakClient(providerMetadata: object) {
        let isDuplicateClient = false;

        try {
            const entityId: string = (providerMetadata as any).entity_id;

            // for now, for sample app, just grab a new token every time
            this.accessToken = await this.getBearerToken();

            // get client
            const keycloakClientsEndpoint =
                `${this.keycloakAdminBaseEndpointUrl}/clients?clientId=${entityId}`;

            const req = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                url: keycloakClientsEndpoint,
                json: true
            };

            const response = await request(req);
            LOG.debug(`Duplicate check response: ${JSON.stringify(response, null, 4)}`);

            isDuplicateClient = (response && response.length === 1);
        } catch (err) {
            LOG.error(`getDuplicateCheckResult: ${err}`);
        }

        return isDuplicateClient;
    }

    /**
     * Get the SAML certificate from Keycloak
     */
    private async getCertificate(): Promise<string> {
        const samlXml = await request({
            method: 'GET',
            url: `${this.keycloakBaseEndpointUrl}/protocol/saml/descriptor`
        });

        const regEx = /<ds:X509Certificate>(.*)<\/ds:X509Certificate>/gms;
        const matches = regEx.exec(samlXml);
        if (matches.length === 2) {
            return matches[1];
        }

        return null;
    }
}
