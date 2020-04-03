import {OAuthRecord} from "./oauth.model";

/**
 * <Model> that represents all of the information for a whitelisted FastFed IdP/Governance provider
 */
export class WhitelistRecord {

    private entityId: string;
    private domain: string;
    private identityProviderJwksUri: string;
    private metadata: object;
    private expiresOn: number;
    private isSuccess: boolean;
    private isCompleted: boolean;
    private errorMessage: string;
    private oauth: OAuthRecord;

    constructor(entityId: string, domain: string, identityProviderJwksUri: string, metadata: object, expiresOn: number ) {
        this.entityId = entityId;
        this.domain = domain;
        this.identityProviderJwksUri = identityProviderJwksUri;
        this.metadata = metadata;
        this.expiresOn = expiresOn;
    }

    public getEntityId(): string {
        return this.entityId;
    }

    public getDomain(): string {
        return this.domain;
    }

    public getIdentityProviderJwksUri(): string {
        return this.identityProviderJwksUri;
    }

    public getMetadata(): object {
        return this.metadata;
    }

    public getExpiresOn(): number {
        return this.expiresOn;
    }

    public getSuccess(): boolean {
        return this.isSuccess;
    }

    public setSuccess(value: boolean) {
        this.isSuccess = value;
    }

    public getCompleted(): boolean {
        return this.isCompleted;
    }

    public setCompleted(value: boolean) {
        this.isCompleted = value;
    }

    public getErrorMessage(): string {
        return this.errorMessage;
    }

    public setErrorMessage(value: string) {
        this.errorMessage = value;
    }

    public getOAuthRecord() {
        return this.oauth;
    }

    public setOAuthRecord(oauthRecord: OAuthRecord) {
        this.oauth = oauthRecord;
    }
}
