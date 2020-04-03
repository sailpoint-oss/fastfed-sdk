import {DuplicateCheckResult} from "./duplicateCheckResult.model";

/**
 * Class representing information about the discovered FastFed metadata
 * TODO:  common base class for this and DiscoveryResult for the overlapping fields
 */
export class IdpConfirmationResult {
    /**
     * The application provider's entity id
     */
    public entityId: string;

    /**
     * The application provider's friendly display name
     */
    public displayName: string;

    /**
     * Metadata from the discovered FastFed Metadata endpoint
     */
    public fastFedMetadata: object;
    
    /**
     * The JSON representation of the desired user attributes that the admin must consent to for the
     * chosen grammar
     */
    public requestedAttributes: object;

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
     * Corresponding message/information about the metadata retrieval attempt
     */
    public message: string;

    /**
     * True if there is an application provider setup existing already for this IdP (FastFed Section 7.2.2.4)
     */
    public duplicateCheckResults: DuplicateCheckResult;

    /**
     * The chosen grammar
     */
    public grammar: string;

    constructor() {
        this.isError = false;
        this.message = "";
        this.duplicateCheckResults = new DuplicateCheckResult(false, false);
    }

}
