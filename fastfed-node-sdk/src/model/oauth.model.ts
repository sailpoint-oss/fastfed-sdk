/**
 * Class that represents OAuth related information used by a provisioning application
 */
export class OAuthRecord {

    constructor(public accessToken: string, public expiresIn: number, public tokenType: string) {
    }

    /**
     * Convert to a FastFed/OAuth standard JSON
     */
    public toJson() : string {
        return JSON.stringify({
            access_token: this.accessToken,
            expires_in: this.expiresIn,
            token_type: this.tokenType
        });
    }
}
