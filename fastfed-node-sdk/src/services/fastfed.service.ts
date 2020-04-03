import jose, {JWT} from 'jose';
import LOG from '../logger';
import {IdPService} from "./idp.service";
import {ApplicationProviderService} from "./applicationProvider.service";

/*
Service for FastFed IdP related functionality
 */
export class FastFedService {

    /**
     * Constructor to create a FastFedServiceSdk for a particular provider
     * required if an IApplicationProvider is specified
     *
     * This SDK gives the ability for the provider to act as an IdP, Application, or both.  idpProvider AND
     * applicationProvider cannot both be null.
     *
     * @param _idpService
     * @param _applicationProviderService
     */
    public constructor(private _idpService: IdPService, private _applicationProviderService: ApplicationProviderService) {

        if (!_idpService && !_applicationProviderService) {
            throw new Error("The FastFed SDK must act as an IdP and/or an Application Provider");
        }
    }


    getIdPService(): IdPService {
        return this._idpService;
    }

    getApplicationProviderService(): ApplicationProviderService {
        return this._applicationProviderService;
    }

    /*
    Get the FastFed metadata for this IdP
    */
    public getMetadata(): object {

        let metadata = {};

        // TODO: combine metadatas
        if (this._idpService) {
            metadata = {
                ...metadata,
                ...this._idpService.getProvider().getMetadata()
            };
        }

        if (this._applicationProviderService) {
            metadata = {
                ...metadata,
                ...this._applicationProviderService.getProvider().getMetadata()
            }
        }

        return metadata;
    }


}

