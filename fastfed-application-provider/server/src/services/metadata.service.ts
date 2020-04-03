import * as FastFedSDK from 'fastfed-node-sdk';

/**
 * Service responsible for metadata related functionality
 */
class MetadataService {
    constructor() {
    }

    /**
     * Get the FAstFed metadata when this application is acting as an application provider
     */
    public getApplicationProviderMetadata(): object {
        const serverName = `${FastFedSDK.ConfigurationService.getApplicationServerName()}`;
        const coreMetadata: object = this.getCoreMetadata();

        return {
            application_provider: {
                ...coreMetadata,
                fastfed_handshake_register_uri: `${FastFedSDK.ConfigurationService.getFastFedProtocol()}://${serverName}/fastfed/register`,
                desired_attributes: [
                    {
                        'urn:ietf:params:fastfed:1:0:schemas:scim:2.0': {
                            required_user_attributes: [
                                'externalId',
                                'username',
                                'active',
                                'emails[primary eq true]'
                            ],
                            optional_user_attributes: [
                                'displayName',
                                'name.givenName',
                                'name.familyName',
                                'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:*',
                                'urn:scim:my:custom:schema:customAttribute'
                            ],
                            required_group_attributes: [
                                'displayName'
                            ],
                            optional_group_attributes: [
                                'externalId',
                                'members'
                            ]
                        }
                    }
                ]
            }
        }
    }

    /**
     * Get the FAstFed metadata when this application is acting as an IdP
     */
    public getIdentityProviderMetadata(): object {
        const serverName = `${FastFedSDK.ConfigurationService.getApplicationServerName()}`;
        const coreMetadata: object = this.getCoreMetadata();

        return {
            identity_provider: {
                ...coreMetadata,
                fastfed_handshake_start_uri: `${FastFedSDK.ConfigurationService.getFastFedProtocol()}://${serverName}/fastfed/start`
            },
        };
    }


    private getCoreMetadata(): object {
        const serverName = `${FastFedSDK.ConfigurationService.getApplicationServerName()}`;
        return {
            entity_id: `${FastFedSDK.ConfigurationService.getEntityId()}`,
            provider_domain: `${FastFedSDK.ConfigurationService.getDomain()}`,
            provider_contact_information: {
                contact_information: {
                    organization: `${process.env.CONTACT_ORG || 'Example Company'}`,
                    phone: `${process.env.CONTACT_PHONE || '+1-800-555-5555'}`,
                    email: `${process.env.CONTACT_EMAIL || 'support@example.com'}`
                }
            },
            display_settings: {
                display_name: `${FastFedSDK.ConfigurationService.getApplicationDisplayName()}`,
                logo_uri: 'https://www.example.com/images/logo.png',
                icon_uri: 'https://www.example.com/images/icon.png',
                license: 'https://openid.net/intellectual-property/licenses/fastfed/1.0/'
            },
            capabilities: {
                authentication_profiles: [
                    FastFedSDK.SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_AUTHENTICATION_SAML_2_0_BASIC
                ],
                provisioning_profiles: [
                    FastFedSDK.SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_PROVISIONING_SCIM_2_0_BASIC
                ],
                schema_grammars: [
                    'urn:ietf:params:fastfed:1:0:schemas:scim:2.0'
                ],
                signing_alg_values_supported: [
                    'RS256'
                ]
            },
            jwks_uri: `${FastFedSDK.ConfigurationService.getJwksProtocol()}://${serverName}/jwks/keys`,
        };
    }


    /**
     * Get registration metadata to return to an IdP.
     * This is only applicable when this application is acting as an application provider
     */
    public getRegistrationMetadata(): object {

        const serverUrlBase = `${FastFedSDK.ConfigurationService.getFastFedProtocol()}://${FastFedSDK.ConfigurationService.getApplicationServerName()}`;
        return {
            fastfed_handshake_finalize_uri: `${serverUrlBase}/fastfed/finalize`,
            'urn:ietf:params:fastfed:1.0:authentication:saml:2.0:basic': {
                saml_metatadata_uri: `${serverUrlBase}/saml/metadata`
            },
            'urn:ietf:params:fastfed:1.0:provisioning:scim:2.0:basic': {
                scim_service_uri: `${serverUrlBase}/scim`,
                provider_authentication_methods: 'urn:ietf:params:fastfed:1.0:provider_authentication:oauth:2.0:jwt_profile',
                'urn:ietf:params:fastfed:1.0:provider_authentication:oauth:2.0:jwt_profile': {
                    token_endpoint: `${serverUrlBase}/oauth/token`,
                    scope: 'scim'
                }
            }
        }
    }
}

const MetadataServiceInstance: MetadataService = new MetadataService();
export default MetadataServiceInstance;
