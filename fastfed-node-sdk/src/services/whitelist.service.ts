import {ConfigurationService, IWhitelistProvider} from "..";
import {DiscoveryResult, WhitelistRecord} from "..";
import jose from "jose";
import moment from 'moment';

/**
 * Wrapper service used to call an application provider's whitelisting provider's implementation
 */

export class WhitelistService {
    constructor(private whitelistProvider: IWhitelistProvider) {
    }

    /**
     * Build a WhitelistRecord from a retrieved FastFed metadata JSON
     * @param providerMetadata
     */
    public static fromFastFedProviderMetadata(providerMetadata: string | object, expiresOn?: number): WhitelistRecord {

        let metadata: any = null;
        if (typeof providerMetadata === "string") {
            metadata = JSON.parse(providerMetadata);
        }  else {
            metadata = providerMetadata;
        }


        return new WhitelistRecord(
            metadata.entity_id,
            metadata.provider_domain,
            metadata.jwks_uri,
            metadata,
            expiresOn || this.getExpiresOn()
        );
    }

    /**
     * Add a record through the whitelist provider
     * @param whitelistRecord record to add
     */
    public add(whitelistRecord: WhitelistRecord) {
        return this.whitelistProvider.add(whitelistRecord);
    }

    /**
     * Remove a record through the whitelist provider
     * @param entityId
     */
    public remove(entityId: string) {
        this.whitelistProvider.remove(entityId);
    }

    /**
     * Get a record through the whitelist provider
     * @param entityId the unique identifier of the Idp
     */
    public get(entityId: string): WhitelistRecord {
        return this.whitelistProvider.get(entityId);
    }

    /**
     * Update a record through the whitelist provider
     * @param whitelistRecord record to update
     */
    public update(whitelistRecord: WhitelistRecord) {
        this.whitelistProvider.update(whitelistRecord);
    }

    /**
     * Helper to confirm/consent that an app provider's administrator has verified that an IdP
     * has access to the IdP's capabilities/attributes
     * @param discoveryResult a DiscoveryResult object to be confirmed
     */
    public confirm(discoveryResult: DiscoveryResult) {
        this.add(WhitelistService.fromFastFedProviderMetadata(discoveryResult.fastFedMetadata));
    }

    /**
     * Helper (alias) to cancel/remove a currently pending whitelisted entity
     * @param entityId the whitelisted entity id to cancel
     */
    public cancel(entityId: string) {
        this.remove(entityId);
    }

    /**
     * Helper (alias) to cancel/remove a currently pending whitelisted entity
     * @param entityId the whitelisted entity id to cancel
     */
    public isPending(entityId: string): boolean {
        return (this.get(entityId) != null);
    }

    public async verifyJwtWhitelisted(token: string): Promise<WhitelistRecord> {

        // get the IdP/GovProv from the whitelist
        const decodedJwt = jose.JWT.decode(token, {complete: true});

        const idpEntityId = decodedJwt.payload['iss'];
        const whitelistRecord: WhitelistRecord = await this.get(idpEntityId);
        if (whitelistRecord == null) {
            console.error(`The IdP entityid ${idpEntityId} was not found whitelisted to perform FastFed handshake process.`);
            throw new Error("The provider specified was not whitelisted to perform the FastFed handshake process");
        }

        console.debug(`retrieved whitelisted provider information for entityId: ${idpEntityId}`);

        return whitelistRecord;
    }

    private static getExpiresOn(): number {
        return moment()
            .add(ConfigurationService.getWhitelistExpirationHours(), 'hours')
            .toDate()
            .getTime();
    }

}

