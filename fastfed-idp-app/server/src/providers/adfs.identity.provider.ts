import * as FastFedSDK from 'fastfed-node-sdk';
import PowerShell from 'node-powershell'
import path from 'path';
import fs from 'fs';

export class AdfsIdentityProvider implements FastFedSDK.IIdentityProvider {

    public getSamlConfig() {
        const certsFolder = 'saml.certs';

        const serverName = process.env.FASTFED_APP_SERVER;
        const protocol = process.env.PROTOCOL || 'https';
        const baseUrl = `${protocol}://${serverName}`;

        const config: any = {
            entryPoint: process.env.ADFS_ENTRY_POINT,
            logoutCallbackUrl: `${baseUrl}/saml/logout`,
            issuer: 'urn:fastfed:adfs:idp',
            callbackUrl: `${baseUrl}/saml/login`,
            signatureAlgorithm: 'sha256',
            authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password',
            identifierFormat: null,
            RACComparison: 'exact',
            // privateCert: fs.readFileSync(path.join(certsFolder, "server.key"), 'utf-8'),
            cert: fs.readFileSync(path.join(certsFolder, 'adfs.cer'), 'utf-8'),
        };

        return config;
    }

    // TODO: post POC, make the logo urls configurable
    public getMetadata(): any {
        const serverName = process.env.FASTFED_APP_SERVER;
        const protocol = process.env.PROTOCOL || 'https';
        return {
            identity_provider: {
                entity_id: `${FastFedSDK.ConfigurationService.getEntityId()}`,
                provider_domain: process.env.DOMAIN,
                tenant_id: 'adfs',
                display_settings: {
                    display_name: 'FastFed ADFS Identity Provider Demo',
                    logo_uri: 'https://www.example.com/images/logo.png',
                    icon_uri: 'https://www.example.com/images/icon.png',
                    license: 'https://openid.net/intellectual-property/licenses/fastfed/1.0/'
                },
                capabilities: {
                    authentication_profiles: [
                        'urn:ietf:params:fastfed:1.0:authentication:SAML:Basic',
                    ],
                    schema_grammars: [
                        'urn:ietf:params:fastfed:1:0:schemas:scim:2.0'
                    ],
                    signing_alg_values_supported: [
                        'RS256'
                    ]
                },
                provider_identity: {
                    jwks_uri: `${protocol}://${serverName}/jwks/keys`,
                    contact_information: {
                        organization: 'FastFed Demo',
                        phone: '+1-800-555-5555',
                        email: 'demo@example.com'
                    }
                },
                fastfed_handshake_start_uri: `${protocol}://${serverName}/fastfed/start`
            }
        };
    }

    /**
     * Add the FastFed provider's authentication information to the IdP
     * @param fastfedAuthenticationObject
     */
    public async addAuthenticationApplication(fastfedAuthenticationObject: FastFedSDK.FastFedAuthenticationObject): Promise<void> {
        const powerShell = new PowerShell({
            executionPolicy: 'Bypass',
            noProfile: true,
            verbose: true
        });

        try {
            const entityId = fastfedAuthenticationObject.entityId;
            await powerShell.clear();
            await powerShell.addCommand(`[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12`);
            await powerShell.addCommand(
                `Add-AdfsRelyingPartyTrust -Name "${fastfedAuthenticationObject.entityId}" -MetadataUrl ${fastfedAuthenticationObject.getAuthEndpointUrl()}`);

            return await powerShell.invoke();
        } catch (err) {
            throw err;
        } finally {
            powerShell.dispose();
        }
    }

    /**
     * Remove the FastFed provider's authentication information to the IdP
     * @param entityId
     */
    public async removeAuthenticationApplication(entityId: string): Promise<any> {
        let output: string = null;

        const powerShell = new PowerShell({
            executionPolicy: 'Bypass',
            noProfile: true,
            verbose: true
        });

        try {
            await powerShell.clear();
            await powerShell.addCommand(`Remove-AdfsRelyingPartyTrust -TargetName "${entityId}"`);

            // return the output from the powershell invocation
            output = await powerShell.invoke();
        } finally {
            powerShell.dispose();
        }
    }


    public async addProvisioningApplication(fastFedProvisioningObject: FastFedSDK.FastFedProvisioningObject): Promise<void> {

    }

    public async removeProvisioningApplication(entityId: string): Promise<any> {

    }

    public async getDuplicateCheckResult(idpMetadata: object): Promise<FastFedSDK.DuplicateCheckResult> {
        // TODO: check for duplicate
        return new FastFedSDK.DuplicateCheckResult(false, false);
    }

}
