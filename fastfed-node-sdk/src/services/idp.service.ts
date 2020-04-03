import requestPromise from 'request-promise-native';
import {
    DiscoveryResult,
    FastFedAuthenticationObject,
    FastFedProvisioningObject,
    IIdentityProvider,
    IJwksProvider,
    SdkConstants
} from '..';
import LOG from '../logger';
import {ServiceBase} from './service.base';
import {IdpConfirmationResult} from '../model/idpConfirmationResult.model';

/**
 * Service that is utilized when the SDK is being used as an identity provider.  This is mostly
 * to keep code organized logically for the identity provider functionality
 */

export class IdPService extends ServiceBase {

    /**
     * Constructor to create a FastFedServiceSdk for a particular provider
     * @param idpProvider an IIdentityProvider implementation if acting as an IdP.  Can be null
     * required if an IApplicationProvider is specified
     *
     */
    public constructor(private idpProvider: IIdentityProvider,
                       private jwksProvider: IJwksProvider) {

        super(jwksProvider);

        if (!idpProvider) {
            throw new Error('The IdP FastFed provider was not specified.');
        }
    }


    protected getMetadata() {
        return this.idpProvider.getMetadata();
    }

    /**
     * Get the identity provider implementation
     */
    public getProvider(): IIdentityProvider {
        return this.idpProvider;
    }

    /**
     * Do that FastFed handshake from start to end.
     * @param applicationProviderFastFedMetadata FastFed metadata that has already been consented to and had duplicate
     * warnings/updates corrected
     */
    public async handshakeStart(applicationProviderFastFedMetadata: object) {

        const entityId: string = (applicationProviderFastFedMetadata as any).entity_id;

        LOG.debug(`calling fastfed application register endpoint`);
        try {
            const registerResponse: any = await this.postFastFedHandshakeRegisterMetadata(applicationProviderFastFedMetadata);

            LOG.debug(`response received from register endpoint: ${registerResponse.body}`);
            const registerResponseObj = JSON.parse(registerResponse.body);

            // use the response from the registration to now do any provisioning/sso setup that is needed

            const applicationProviderSamlMetadata = this.getChildMetadataObject(registerResponseObj,
                SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_AUTHENTICATION_SAML_2_0_BASIC);

            const authMetadataUrl = applicationProviderSamlMetadata[SdkConstants.SAML_METATADATA_URI];
            await this.processRegistrationResponseAuthMetadata(
                entityId, authMetadataUrl, applicationProviderFastFedMetadata
            );

            const applicationProviderProvisioningMetadata = this.getChildMetadataObject(registerResponseObj,
                SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_PROVISIONING_SCIM_2_0_BASIC);
            const scimMetadataUrl = applicationProviderProvisioningMetadata[SdkConstants.SCIM_SERVICE_URI];

            await this.processRegistrationResponseProvisioningMetadata(
                entityId, scimMetadataUrl, applicationProviderFastFedMetadata
            );

            LOG.debug(`calling fastfed application finalize endpoint`);
            await this.postFastFedFinalize(applicationProviderFastFedMetadata, registerResponseObj);

        } catch (err) {
            throw new Error(`Unable to obtain a valid response from the handshake register call to the application provider. ${err}`);
        }
    }

    /**
     * Return application provider FastFed "discovery" results.
     * @param appProviderMetadataUrl url to the application provider's Fastfed metadata
     * @return a DiscoveryResult object with consent, duplicate, etc., information for a UI
     *
     */
    public async getConfirmationRequirements(appProviderMetadataUrl: string):
        Promise<IdpConfirmationResult> {

        let result: IdpConfirmationResult = null;

        try {
            // get the application provider's confirmation metadata
            result = await this.getRequiredConfirmationInformation(appProviderMetadataUrl);
        } catch (err) {
            LOG.error(err.message);
            throw err;
        }

        return result;
    }

    /**
     * Get fastfed metadata and related information for UI to use as sees fit
     * @param appProviderFastFedMetadataUrl url to the app provider metadata
     */
    private async getRequiredConfirmationInformation(appProviderFastFedMetadataUrl: string): Promise<IdpConfirmationResult> {

        const result: IdpConfirmationResult = new IdpConfirmationResult();

        try {
            LOG.debug(`Getting idp confirmation metadata for app provider url: ${appProviderFastFedMetadataUrl}`);

            const applicationProviderFastFedMetadata: any =
                await this.getFastFedMetadata(appProviderFastFedMetadataUrl, SdkConstants.APPLICATION_PROVIDER);

            if (!applicationProviderFastFedMetadata) {
                throw new Error('Unable to obtain the FastFed application provider metadata');
            }

            const commonCapabilities =
                this.verifyCompatibility(applicationProviderFastFedMetadata, SdkConstants.IDENTITY_PROVIDER);

            // need the common schema grammars.  choose it or pick one based on some IdP preferences.  For now,
            // since they are common grammars, just use the first one
            const grammars = commonCapabilities[SdkConstants.SCHEMA_GRAMMARS] || [];
            if (grammars.length === 0) {
                throw new Error('There are no common schema grammars between this IdP and the application provider!');
            }

            const grammar = grammars[0];

            result.entityId = applicationProviderFastFedMetadata.entity_id;
            result.displayName = applicationProviderFastFedMetadata.display_settings.display_name;
            result.duplicateCheckResults = await this.idpProvider.getDuplicateCheckResult(applicationProviderFastFedMetadata);
            result.fastFedMetadata = applicationProviderFastFedMetadata;

            // get the attributes that need to be consented sfor the chosen grammar
            result.grammar = grammar;

            const foundRecord = applicationProviderFastFedMetadata
                .desired_attributes
                .find(g => g.hasOwnProperty(grammar));

            if (!foundRecord) {
                throw new Error(`Unable to find the ${grammar}'s desired attributes!`);
            }

            result.requestedAttributes = foundRecord[grammar];
            result.commonCapabilities = commonCapabilities;

            // TODO:  determine if updates are needed and report this information back to the UI in the confirmation results
        } catch (err) {
            result.isError = true;
            result.message = err;
        }

        return result;
    }

    /**
     * Perform the FastFed finalize step by calling the finalize endpoint on the application provider
     * @param applicationProviderMetadata the application provider's metadata
     * @param registrationResponseObj the registration response from the application server's /register endpoint
     */
    private async postFastFedFinalize(applicationProviderMetadata: any, registrationResponseObj: any) {
        LOG.debug(`postFastFedFinalize entered`);

        // send the finalize to the application provider
        const applicationProviderEntityId = applicationProviderMetadata.entity_id;
        const finalizeUrl = this.getApplicationProviderFinalizeUrl(registrationResponseObj);

        LOG.debug(`application provider entityId: ${applicationProviderEntityId}`);
        LOG.debug(`finalize url: ${finalizeUrl}`);

        if (finalizeUrl) {

            const requestJWT = this.idpProvider.getFinalizeRequest(applicationProviderEntityId);
            const token = this.getJwksService().getSignedJwtJson(requestJWT);

            LOG.debug(`finalize payload: ${token}`);
            const options = this.getPostJWTOptions(finalizeUrl, token);

            return await requestPromise(options);
        }
    }

    /**
     * Posts signed JWT with this provider specific payload to the application provider specified FastFed registration URL
     * @param applicationProviderMetadataObj the application provider's metadata
     */
    private async postFastFedHandshakeRegisterMetadata(applicationProviderMetadataObj: any) {

        LOG.debug(`postFastFedHandshakeRegisterMetadata called`);
        const handshakeRegisterUrl = applicationProviderMetadataObj.fastfed_handshake_register_uri;
        const applicationProviderEntityId = applicationProviderMetadataObj.entity_id;

        LOG.debug(`handshake register url: ${handshakeRegisterUrl}`);
        LOG.debug(`application provider entityId: ${applicationProviderEntityId}`);

        const requestJWT = this.idpProvider.getRegistrationRequest(applicationProviderEntityId);
        const token = this.getJwksService().getSignedJwtJson(requestJWT);

        LOG.debug(`registrer post payload: ${token}`);
        const options = this.getPostJWTOptions(handshakeRegisterUrl, token);

        return await requestPromise(options);
    }

    /**
     *  Process the application provider's auth metadata.
     *
     * This method takes the auth metadata retrieved from the application provider and calls provider to add
     * any necessary authentication related functionality
     * @param entityId the provider's entityid
     * @param authMetadataUrl
     * @param fastfedMetadata
     */
    private async processRegistrationResponseAuthMetadata(entityId: string,
                                                          authMetadataUrl: string,
                                                          fastfedMetadata: object) {

        if (!authMetadataUrl) {
            throw new Error('Unable to retrieve saml metadata url value from FastFed metadata');
        }

        // TODO:  retrieve data from endpoint and add to the FastFedAuthenticationObject
        const response = await requestPromise({
            method: 'GET',
            uri: authMetadataUrl,
            resolveWithFullResponse: true
        });

        const authObj = new FastFedAuthenticationObject(
            entityId,
            authMetadataUrl,
            response.body,
            fastfedMetadata
        );

        return this.idpProvider.addAuthenticationApplication(authObj);

    }

    /**
     * Process the application provider's provisioning metadata.
     *
     * This method takes the provisioning metadata retrieved from the application provider and calls provider to add
     * any necessary provisioning related functionality
     * @param entityId the provider's entityid
     * @param provisioningMetadata the metadata JSON object with the provisioning metadata
     */
    private async processRegistrationResponseProvisioningMetadata(entityId: string,
                                                                  scimMetadataUrl: string,
                                                                  fastfedProviderMetadata: object) {

        if (!scimMetadataUrl) {
            throw new Error('Unable to retrieve SCIM metadata url value from FastFed metadata');
        }

        const provisioningObject = new FastFedProvisioningObject(
            entityId,
            scimMetadataUrl,
            fastfedProviderMetadata
        );

        return this.idpProvider.addProvisioningApplication(provisioningObject);

    }

    /**
     * Get the FastFed finalize URL from the application provider's FastFed metadata
     */
    private getApplicationProviderFinalizeUrl(appProviderMetadata: any) {
        if (appProviderMetadata && appProviderMetadata.fastfed_handshake_finalize_uri) {
            return appProviderMetadata.fastfed_handshake_finalize_uri;
        }

        return null;
    }
}

