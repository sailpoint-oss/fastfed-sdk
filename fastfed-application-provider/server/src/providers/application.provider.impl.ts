import {FastFedProvisioningObject, FastFedAuthenticationObject, DuplicateCheckResult, IApplicationProvider} from 'fastfed-node-sdk';
import MetadataServiceInstance from '../services/metadata.service';
import {AuthService} from '../services/auth.service';
import LOG from '../common/logger'
import SettingsServiceInstance from '../services/settings.service';

class FastFedApplicationProviderImpl implements IApplicationProvider {

    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    /**
     * Get the metadata for this FastFed provider
     */
    public getMetadata(): object {
        return MetadataServiceInstance.getApplicationProviderMetadata();
    }

    public getRegistrationMetadata(): object {
        return MetadataServiceInstance.getRegistrationMetadata();
    }

    /**
     * Add an application for SAML/SSO capabilities a trust store
     * @param fastfedAuthenticationObject
     */
    public async addAuthenticationApplication(fastfedAuthenticationObject: FastFedAuthenticationObject): Promise<void> {
       await SettingsServiceInstance.addSSO(fastfedAuthenticationObject);
    }

    /**
     * Remove an application from the SSO/SAML trust store
     * @param entityId
     */
    public async removeAuthenticationApplication(entityId: string): Promise<void> {
        throw new Error('Not implemented');
    }

    /**
     * Add information pertaining to an application that will be able to call in to this server
     */
    public async addProvisioningApplication(fastfedProvisioningObject: FastFedProvisioningObject): Promise<any> {
        await this.authService.createBearerToken(fastfedProvisioningObject);
    }

    public async removeProvisioningApplication(applicationName: string): Promise<void> {
        // throw new Error("Not implemented");
    }

    /**
     * Determine if the FastFed metadata will cause a duplication of some functionality  (SSO, provisioning) at the
     * application provider
     */
    public async getDuplicateCheckResult(): Promise<DuplicateCheckResult> {
        return new DuplicateCheckResult(false, false);
    }
}

const ApplicationProviderInstance = new FastFedApplicationProviderImpl();
export default ApplicationProviderInstance;
