import {FastFedObject} from "./fastfedObject.model";
import {SdkConstants} from "../sdkConstants";

/**
 * Class for stroring FastFed information pertaining to authentication
 */
export class FastFedAuthenticationObject extends FastFedObject {

    private authEndpointUrl: string;
    private authEndpointResponseBody: string;

    public getAuthEndpointUrl(): string {
        return this.authEndpointUrl;
    }


    public getAuthEndpointResponseBody(): string {
        return this.authEndpointResponseBody;
    }

    /**
     * Create a FastFedAuthenticationObject
     * @param entityId provider's entity id
     * @param authEndpointUrl saml endpoint for the provider
     * @param authEndpointResponseBody the response body from a request to the authEndpointUrl
     * @param fastfedProviderMetadata full FastFed metadata for the provider
     * @param authenticationProfileUrn FastFed authentication profile URN
     */
    constructor(entityId: string,
                authEndpointUrl: string,
                authEndpointResponseBody: string,
                fastfedProviderMetadata: any,
                authenticationProfileUrn: string = SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_AUTHENTICATION_SAML_2_0_BASIC) {

        super(entityId, fastfedProviderMetadata, authenticationProfileUrn);

        this.authEndpointUrl = authEndpointUrl;
        this.authEndpointResponseBody = authEndpointResponseBody;
    }
}
