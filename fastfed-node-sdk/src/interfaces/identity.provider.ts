import {IFastFedProvider} from "./fastfed.provider"
import { JWTRequest } from '../model/JWTRequest.model';

export interface IIdentityProvider extends IFastFedProvider {
    /**
     * Get a JWT payload and header for a particular application provider for the registration request.
     * @param applicationProviderEntityId the entityId of the application provider
     */
    getRegistrationRequest(applicationProviderEntityId: string): JWTRequest;

    /**
     * Get a JWT payload and header for a particular application provider for the finalize request
     * @param applicationProviderEntityId the entityId of the application provider
     */
    getFinalizeRequest(applicationProviderEntityId: string): JWTRequest;
}
