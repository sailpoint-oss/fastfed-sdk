import {DuplicateCheckResult} from "./duplicateCheckResult.model";

/**
 * Class representing information about the discovered FastFed metadata
 */

// TODO:  common base class for this and IdpConfirmationResult for the overlapping fields
export class DiscoveryResult {
    public entityId: string;

    /**
     * Url to the jwks endpoint
     */
    public jwksUri: string;

    /**
     * Url to the IdP/Gov provider's FastFed start endpoint
     */
    public startUrl: string;

    /**
     * The discovered application's friendly display name
     */
    public displayName: string;

    /**
     * Metadata from the discovered FastFed Metadata endpoint
     */
    public fastFedMetadata: object;

    /**
     * An IdP/Gov provider's and application provider's common capabilities.  This is the
     * reduced fastfed metadata down to just what is common.  The full metadata is retrieved by getFastFedMetadata()
     */
    public commonCapabilities: object;

    /**
     * True if there an error retrieving the FastFed metadata
     */
    public isError: boolean;

    /**
     * Corresponding message/information about the discovery
     */
    public message: string;

    /**
     * True if there is duplicate idp/governance setup existing already (FastFed Section 7.2.1.3)
     */
    public duplicateCheckResults: DuplicateCheckResult;

    /**
     * True if there is currently a whitelisted record still pending for the idp/gov provider  (FastFed Section 7.2.1.6)
     */
    public isWhitelistPending: boolean;


    constructor() {
        this.isError = false;
        this.message = "";
        this.startUrl = "";
        this.duplicateCheckResults = new DuplicateCheckResult(false, false);
        this.isWhitelistPending = false;
    }

}
