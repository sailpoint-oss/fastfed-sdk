import requestPromise from 'request-promise-native';
import {
    DiscoveryResult,
    DiscoveryType,
    FastFedAuthenticationObject,
    FastFedProvisioningObject,
    IApplicationProvider,
    IJwksProvider,
    IWhitelistProvider,
    SdkConstants,
    WhitelistRecord,
    WhitelistService
} from '..';
import {WebFingerService} from './webfinger.service';
import LOG from '../logger';
import {ServiceBase} from './service.base';
import jose from 'jose';
import CompleteResult = jose.JWT.completeResult;


/**
 * Service that is utilized when the SDK is being used as an application provider.  This is mostly
 * to keep code organized logically for the application provider functionality
 */

export class ApplicationProviderService extends ServiceBase {

    private whitelistService: WhitelistService;
    private webFingerService: WebFingerService;


    /**
     * Constructor to create a FastFedServiceSdk for a particular provider
     * @param applicationProvider an IApplicationProvider implementation for this application provider
     * required if an IApplicationProvider is specified
     * @param whitelistProvider an IWhitelistProvider implementation for this application provider
     * @param jwksProvider a IJWKSProvider implementation for this application provider
     */
    public constructor(private applicationProvider: IApplicationProvider,
                       private whitelistProvider: IWhitelistProvider,
                       private jwksProvider: IJwksProvider) {

        super(jwksProvider);

        if (!applicationProvider || !whitelistProvider) {
            throw new Error('The IdP FastFed application provider and/or whitelist provider was not specified.');
        }

        this.whitelistService = new WhitelistService(whitelistProvider);
        this.webFingerService = new WebFingerService();
    }

    protected getMetadata() {
        return this.applicationProvider.getMetadata();
    }

    /**
     * Get the application provider implementation
     */
    public getProvider(): IApplicationProvider {
        return this.applicationProvider;
    }

    /**
     * Get the whitelist provider implementation
     */
    public getWhitelistProvider(): IWhitelistProvider {
        return this.whitelistProvider;
    }

    /**
     * Allows for the provider to call back to this application provider to indicate that it successfully completed
     * its side of the handshake
     *
     * @param token an undecoded, signed JWT token
     * @throws IOException
     */
    public async handshakeFinalize(token: string) {
        LOG.debug('Entered finalizeFastFed');

        try {

            const whitelistRecord: WhitelistRecord = await this.whitelistService.verifyJwtWhitelisted(token);
            await this.getJwksService().verifySignedJwt(token, whitelistRecord.getIdentityProviderJwksUri());

            // TODO: mark as completed?  Or delete record completely?  For now, we will just delete
            // the pending entry from the whitelist
            // a success here is recorded.  a failure exception above will not update the
            // whitelisted record.  it will either expire at some point or be retried, etc.
            // whitelistRecord.setSuccess(true);
            // whitelistRecord.setCompleted(true);

            // there is nothing left to do, we are all set up!  Delete the record

            // update the whitelist if we decode and verify the JWT  properly.
            this.whitelistService.remove(whitelistRecord.getEntityId());

        } catch (err) {
            LOG.error('Unable to finalize the handshake: ' + err);
            throw err;
        }
    }

    /**
     * FastFed registration endpoint
     * <p>
     * Called by the provider with a signed JWT for us to verify it is a previously whitelisted provider.
     * If valid, this will use the information in the payload to retrieve the provider's SCIM and SAML metadata
     * and call IDN's API to configure SSO and/or create an app
     *
     * @param token an undecoded, signed JWT token
     * @returns the registration's response JSON
     */
    public async handshakeRegister(token: string): Promise<object> {

        LOG.debug('Entered handshakeRegister');

        let registerResponseBody: object = null;

        try {

            const whitelistRecord: WhitelistRecord = await this.whitelistService.verifyJwtWhitelisted(token);
            const jwt: CompleteResult = await this.getJwksService().verifySignedJwt(
                token, whitelistRecord.getIdentityProviderJwksUri());

            await this.processRegistrationRequestAuthenticationClaim(jwt);
            await this.processRegistrationRequestProvisioningClaim(jwt);

            registerResponseBody = this.applicationProvider.getRegistrationMetadata();
        } catch (err) {
            LOG.error(err);
            throw err;
        }

        return registerResponseBody;
    }

    /**
     * Return IdP/Governance provider FastFed metadata using the specified discovery mechanism.  This is
     * specific to an application provider's implementation
     * @param discoveryType type of discovery for retrieving the FastFed metadata (WEBFINGER or MANUAL)
     * @param account email for WebFinger lookup (required when discoveryType is WEBFINGER, ignored otherwise)
     * @param fastfedUrl FastFed metadata endpoint URL (required when discoveryType is MANUAL, ignored otherwise)
     * @return 0 or more DiscoveryResult objects with each discovered endpoint and related metadata
     */
    public async discovery(discoveryType: DiscoveryType, account?: string, fastfedUrl?: string):
        Promise<DiscoveryResult[]> {

        let results: DiscoveryResult[] = [];

        let fastFedMetadataUrls: string[] = [];

        try {
            if (discoveryType === DiscoveryType.WEBFINGER) {

                if (!account) {
                    throw new Error('Account must be specified in the query string for WEBFINGER type.');
                }

                // get the fastfed metadata for the specified account
                fastFedMetadataUrls = await this.webFingerService.getFastfedMetadataUrls(account);

            } else if (discoveryType === DiscoveryType.MANUAL) {

                if (!fastfedUrl) {
                    throw new Error('fastfedMetadataEndpoint must be specified in the query string for MANUAL type.');
                }

                // there is no discovery here really.  will just use the passed in url
                fastFedMetadataUrls = [fastfedUrl];
            } else {
                throw new Error('Invalid discovery type specified');
            }

            if (fastFedMetadataUrls == null) {
                throw new Error('Unable to retrieve the FastFed metadata endpoint through discovery.');
            }

            results = await this.processFastFedMetadataUrls(fastFedMetadataUrls);
        } catch (err) {
            LOG.error(err.message);
            throw err;
        }

        return results;
    }

    private async processFastFedMetadataUrls(fastFedMetadataUrls: string[]) {
        const results: DiscoveryResult[] = [];

        // process all of the urls (WebFinger can return multiple
        await Promise.all(fastFedMetadataUrls.map(async (url) => {
                const isUsable = true;

                try {
                    const result = await this.getDiscoveryResult(url);
                    this.validateDomain(url, (result.fastFedMetadata as any).provider_domain);

                    // compare the IDP capabilities against this application provider
                    result.commonCapabilities = this.verifyCompatibility(result.fastFedMetadata,
                        SdkConstants.APPLICATION_PROVIDER);

                    results.push(result);

                    LOG.debug(`Valid FastFed metadata found at URL: ${url}`);

                } catch (err) {
                    LOG.warn(`Error during FastFed metadata retrieval: ${err}`);
                }
            })
        );

        return results;
    }

    /**
     * Get fastfed metadata and related discovery information for UI to use as sees fit
     * @param url fastfed metadata endpoint
     */
    private async getDiscoveryResult(url: string): Promise<DiscoveryResult> {

        LOG.debug(`Getting discovery result for: ${url}`);

        const metadata: any = await this.getFastFedMetadata(url, SdkConstants.IDENTITY_PROVIDER);

        let startUrl = `${metadata.fastfed_handshake_start_uri}?app_metadata_uri=${process.env.LOCAL_FASTFED_ENDPOINT}`;
        const seconds: number = parseInt((process.env.WHITELIST_EXPIRATION_MINUTES || 24 * 60).toString());
        startUrl += `&expiration=${new Date().getTime() + seconds}`;
        LOG.debug(`startUrl endpoint: ${startUrl}`);

        const result: DiscoveryResult = new DiscoveryResult();
        result.entityId = metadata.entity_id;
        result.displayName = metadata.display_settings.display_name;
        result.jwksUri = metadata.jwks_uri;
        result.isWhitelistPending = this.whitelistService.isPending(metadata.entity_id);
        result.duplicateCheckResults = await this.applicationProvider.getDuplicateCheckResult(metadata);
        result.fastFedMetadata = metadata;
        result.startUrl = startUrl;

        return result;
    }

    /**
     * Processes the provisioning metadata from request that is posted to the application's register endpoint
     * @param jwt the posted, verified and decoded JWT
     */
    private async processRegistrationRequestProvisioningClaim(jwt: jose.JWT.completeResult) {

        // TODO: SCIM only supported currently.  Need to update to use the actual value in the metadata
        // instead of hard-coded URN_IETF_PARAMS_FASTFED_1_0_PROVISIONING_SCIM_FULL_LIFE_CYCLE
        // Need to create interfaces for each of the supported FastFed profiles

        try {
            const payload: any = jwt.payload;
            const claim = this.getChildMetadataObject(jwt.payload, SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_PROVISIONING_SCIM_2_0_BASIC);
            if (claim != null) {
                LOG.debug(`Found claim: ${SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_PROVISIONING_SCIM_2_0_BASIC}`);

                const provAuthMethodObj = claim[SdkConstants.PROVIDER_AUTHENTICATION_METHODS];

                // hard coded for now
                const jwtProfileObj = provAuthMethodObj[SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_PROVIDER_AUTHENTICATION_OAUTH_2_0_JWTPROFILE];
                if (jwtProfileObj == null) {
                    // TODO: is this required to complete a handshake?  Do they need oAuth?
                    LOG.debug(`Didn't find a '${SdkConstants.PROVIDER_AUTHENTICATION_METHODS}' object.  No provisioning to setup`);
                } else {
                    LOG.debug(`Found an '${SdkConstants.PROVIDER_AUTHENTICATION_METHODS}' object.  Setting up provisioning.`);

                    const provObj = new FastFedProvisioningObject(
                        payload.iss,
                        jwtProfileObj[SdkConstants.JWKS_URI],
                        null,
                        jwtProfileObj
                    );

                    await this.applicationProvider.addProvisioningApplication(provObj);
                }
            } else {
                LOG.debug('There is no provisioning claim in the FastFed JWT. Skipping FastFed provisioning process.');
            }
        } catch (err) {
            LOG.error(`Error processing the registration request's provisioning claim: ${err}`);
            throw err;
        }
    }

    /**
     * Processes the authentication metadata from request that is posted to the application's register endpoint
     * @param jwt the posted, verified and decoded JWT
     */
    private async processRegistrationRequestAuthenticationClaim(jwt: jose.JWT.completeResult) {

        try {
            const payload: any = jwt.payload;
            const claim = this.getChildMetadataObject(jwt.payload, SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_AUTHENTICATION_SAML_2_0_BASIC);
            if (claim != null) {
                LOG.debug(`Found claim: ${SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_AUTHENTICATION_SAML_2_0_BASIC}`);

                const idpSamlMetadataUrl = claim[SdkConstants.SAML_METATADATA_URI];

                if (!idpSamlMetadataUrl) {
                    throw new Error('Unable to retrieve saml metadata url value from FastFed metadata');
                }

                LOG.debug(`Found saml metadata url: ${idpSamlMetadataUrl}`);

                const response = await requestPromise({
                    method: 'GET',
                    url: idpSamlMetadataUrl
                });

                const entityId: string = payload.iss;
                const whitelistRecord: WhitelistRecord = await this.whitelistService.get(entityId);
                const authObj = new FastFedAuthenticationObject(
                    entityId,
                    idpSamlMetadataUrl,
                    response,
                    whitelistRecord.getMetadata()
                );

                await this.applicationProvider.addAuthenticationApplication(authObj);
            } else {
                LOG.debug('There is no authentication claim in the FastFed JWT. Skipping FastFed authentication setup process.');
            }
        } catch (err) {
            LOG.error(`Error processing the registration request's authentication claim: ${err}`);
            throw err;
        }
    }
}
