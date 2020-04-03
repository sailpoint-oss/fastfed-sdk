import requestPromise from 'request-promise-native';
import {JwksService} from './jwks.service';
import {IJwksProvider, SdkConstants, ConfigurationService} from '..';
import LOG from '../logger';
import {Helpers} from '../helpers';


export abstract class ServiceBase {

    private jwksService: JwksService;

    constructor(jwksProvider: IJwksProvider) {
        this.jwksService = new JwksService(jwksProvider);
    }

    protected getJwksService(): JwksService {
        return this.jwksService;
    }

    protected abstract getMetadata();

    /**
     * Verifies that the IdP and the application provider are compatible and can perform the
     * necessary handshake
     * @returns the intersection of capabilities of an app provider and IdP/Governance provider's FastFed metadata
     * @param metadata the provider's metadata
     * @param compareToType compare metadata to the APPLICATION_PROVIDER or IDENTITY_PROVIDER metadata record
     */
    protected verifyCompatibility(metadata: object, compareToType: string): object {
        const compareToMetadata = this.getMetadata()[compareToType];

        const intersectedCapabilities = this.intersectObjects(metadata[SdkConstants.CAPABILITIES],
            (compareToMetadata as any).capabilities);

        LOG.debug(JSON.stringify(intersectedCapabilities));

        let [signingAlgsSupported, authProfiles, schemaGrammars, provProfiles] = [[], [], [], []];
        if (intersectedCapabilities) {
            signingAlgsSupported = (intersectedCapabilities[SdkConstants.SIGNING_ALG_VALUES_SUPPORTED] || []);
            authProfiles = (intersectedCapabilities[SdkConstants.AUTHENTICATION_PROFILES] || []);
            schemaGrammars = (intersectedCapabilities[SdkConstants.SCHEMA_GRAMMARS] || []);
            provProfiles = (intersectedCapabilities[SdkConstants.PROVISIONING_PROFILES] || []);
        }
        // valid if at least one auth profile or provisioning profile
        const isValid: boolean = ((authProfiles.length > 0) || (provProfiles.length > 0));

        if (!isValid || signingAlgsSupported.length === 0 || schemaGrammars.length === 0) {
            throw new Error('The IdP and Application Provider are not FastFed compatible.');
        }

        return intersectedCapabilities;
    }

    /**
     * Intersects the IdP and application provider objects to determine where their functionality
     * overlaps
     * @param idpObject the metadata for the server with the /start endpoint
     * @param appProviderObj the metadata for the application provider
     */
    private intersectObjects(idpObject: object, appProviderObj: object) {

        const intersection = {};

        for (const key in idpObject) {
            if (idpObject[key] == appProviderObj[key]) {
                intersection[key] = idpObject[key];
            }

            if (Array.isArray(idpObject[key]) && Array.isArray(appProviderObj[key])) {
                const setA = new Set(idpObject[key]);
                const setB = new Set(appProviderObj[key]);
                const intersectedSet = new Set([...setB].filter(x => setA.has(x)));

                intersection[key] = Array.from(intersectedSet);
            } else if (typeof idpObject[key] == 'object' && typeof appProviderObj[key] == 'object') {
                intersection[key] = this.intersectObjects(appProviderObj[key], idpObject[key]);
            }
        }

        return intersection;
    }

    protected getPostJWTOptions(url: string, token: string): object {
        return {
            method: 'POST',
            headers: {
                // TODO:  fix.  should be application/jwt but need to make sure works in other places
                'Content-Type': 'text/plain'
            },
            uri: url,
            body: token,
            resolveWithFullResponse: true
        };
    }

    /*
  Retrieves an object for given key from the fastfed metadata
   */
    protected getChildMetadataObject(fastFedMetadata: object, key: string) {

        const metadata = fastFedMetadata[key];
        if (!metadata) {
            LOG.error(`Unable to obtain FastFed ${key} object from the provided metadata.`);
        }

        return metadata;
    }

    /**
     * Validate the domain.  See 4.1.1 of the FastFed spec
     * @param url the URL from which the metadata was retrieved
     * @param domain the domain found in the retrieved metadata
     */
    protected validateDomain(url: string, domain: object) {

        const pattern = `${ConfigurationService.getFastFedProtocol()}:\\/\\/.*?${domain}($|\\/.*)`;
        const regEx: RegExp = new RegExp(pattern);

        const isValid: boolean = regEx.test(url);
        if (!isValid) {
            throw new Error('The provider_domain is invalid for the URL in which its FastFed metadata was retrieved');
        }
    }

    /**
     * Gets the FAstFed metadata from the application provider supplied endpoint
     * @param metadataUrl the url to the metadata
     * @param key the JSON key of the object to retrieve (application_provider | identity_provider)
     */
    protected async getFastFedMetadata(metadataUrl: string, key: string): Promise<object> {
       return Helpers.getFastFedMetadata(metadataUrl, key);
    }

}

