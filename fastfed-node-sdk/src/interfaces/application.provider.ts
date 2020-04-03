import {IFastFedProvider} from "./fastfed.provider";

export interface IApplicationProvider extends IFastFedProvider {
    /**
     * Get registration metadata for sending as a response to calling a FastFed registration endpoint endpoint
     */
    getRegistrationMetadata(): object;
}
