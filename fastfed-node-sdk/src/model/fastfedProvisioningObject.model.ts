import {FastFedObject} from "./fastfedObject.model";
import {SdkConstants} from "../sdkConstants";

/**
 * Class for storing FastFed information pertaining to proivisioning
 */
export class FastFedProvisioningObject extends FastFedObject {

    private scimEndpointUrl: string;

    public getScimEndpointUrl(): string {
        return this.scimEndpointUrl;
    }


    /**
     * Create a ProvisioningFastFedObject
     * @param entityId provider's entity id
     * @param scimEndpointUrl SCIM service endpoint url for the provider
     * @param fastfedProviderMetadata full FastFed metadata for the provider
     * @param provisioningProfileUrn FastFed provisioning profile URN
     */
    constructor(entityId: string,
                scimEndpointUrl: string,
                fastfedProviderMetadata: object,
                provisioningProfileUrn: string = SdkConstants.URN_IETF_PARAMS_FASTFED_1_0_PROVISIONING_SCIM_2_0_BASIC) {

        super(entityId, fastfedProviderMetadata, provisioningProfileUrn);

        this.scimEndpointUrl = scimEndpointUrl;
    }
}
