import {FastFedProvisioningObject} from "../model/fastfedProvisioningObject.model";
import {FastFedAuthenticationObject} from "../model/fastfedAuthenticationObject.model";
import {DuplicateCheckResult} from "../model/duplicateCheckResult.model";

/**
 * Interface that needs to be implemented by a FastFed provider
 */
export interface IFastFedProvider {
    getMetadata(): object;

    addAuthenticationApplication(fastfedAuthenticationObject: FastFedAuthenticationObject): Promise<void>;
    removeAuthenticationApplication(entityId: string): Promise<void>;

    addProvisioningApplication(fastFedProvisioningObject: FastFedProvisioningObject): Promise<void>;
    removeProvisioningApplication(entityId: string): Promise<void>;

    /**
     * Determine if the FastFed metadata will cause a duplication of some functionality  (SSO, provisioning) at the
     * application provider
     */
    getDuplicateCheckResult(idpMetadata: object): Promise<DuplicateCheckResult>;
}

