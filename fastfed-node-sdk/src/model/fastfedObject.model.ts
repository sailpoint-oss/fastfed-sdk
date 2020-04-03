/**
 * Base class for a FastFed object that is used to store information retrieved from the FastFed metadata
 */
export abstract class FastFedObject {

    /**
     * Create a FastFedObject
     * @param entityId Entity id for the provider
     * @param fastfedProviderMetadata The full FastFed metadata for the provider
     * @param profileUrn URN of the FastFed profile this object represents
     *        Ex: urn:ietf:params:fastfed:1.0:authentication:saml:2.0:basic
     */
    constructor(public entityId: string, public fastfedProviderMetadata: object, public profileUrn: string) {
        this.entityId = entityId;
        this.fastfedProviderMetadata = fastfedProviderMetadata;
        this.profileUrn = profileUrn;
    }
}
