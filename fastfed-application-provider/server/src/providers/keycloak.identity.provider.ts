import * as FastFedSDK from 'fastfed-node-sdk';
import path from 'path';
import fs from 'fs';
import request from 'request-promise-native';
import Utils from '../common/utils';
import {JWK} from 'jose';
import Key = JWK.Key;


export class KeycloakIdentityProvider implements FastFedSDK.IIdentityProvider {

    private keycloakBaseUrl: string;
    private keycloakAdminBaseEndpointUrl: string;
    private keycloakBaseEndpointUrl: string;
    private keycloakRealm: string;
    private accessToken: string;

    constructor() {
        this.keycloakRealm = (process.env.KEYCLOAK_REALM || 'master');
        this.keycloakBaseUrl = `${process.env.IDP_ENDPOINT_BASE}/auth`;
        this.keycloakAdminBaseEndpointUrl = `${this.keycloakBaseUrl}/admin/realms/${this.keycloakRealm}`;
        this.keycloakBaseEndpointUrl = `${this.keycloakBaseUrl}/realms/${this.keycloakRealm}`;
    }

    public getSamlConfig(rootFolder: string) {
        const certsFolder = './saml.certs';

        const defaultServer = `http://${Utils.getDomain()}`;
        const localServerBase = `${process.env.FASTFED_APP_SERVER || defaultServer }`;
        const config: any = {
            entryPoint: `${this.keycloakBaseEndpointUrl}/protocol/saml`,
            logoutCallbackUrl: `${localServerBase}/saml/logout`,
            issuer: 'urn:fastfed:demo:app-provider',
            host: localServerBase,
            path: `/saml/login`,
            signatureAlgorithm: 'sha256',
            // authnRequestBinding: 'HTTP-POST',
            identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            cert: fs.readFileSync(path.join(certsFolder, 'keycloak.cer'), 'utf-8'),
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
                    logo_uri: 'https://www.labs.sailpoint.com/images/logo.png',
                    icon_uri: 'https://www.labs.sailpoint.com/images/icon.png',
                    license: 'https://openid.net/intellectual-property/licenses/fastfed/1.0/'
                },
                capabilities: {
                    authentication_profiles: [
                        'urn:ietf:params:fastfed:1.0:authentication:saml:2.0.basic',
                    ],
                    // provisioning_profiles: [
                    //     "urn:ietf:params:fastfed:1.0:provisioning:saml:2.0:basic"
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

        const response = await request({
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Authorization': `Bearer ${this.accessToken}`
            },
            url: keycloakConverterEndpoint,
            body: fastfedAuthenticationObject.getAuthEndpointResponseBody()
        });

        return response;
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

        console.log(response);
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

        return new FastFedSDK.DuplicateCheckResult(false, false);
    }

}

const instance: KeycloakIdentityProvider = new KeycloakIdentityProvider();
export let IdentityProviderInstance = instance;
