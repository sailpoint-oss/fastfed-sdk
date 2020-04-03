import * as FastFedSDK from 'fastfed-node-sdk';

class JwksProviderImpl implements FastFedSDK.IJwksProvider {

    constructor() {

    }

    public getMetadata(): any {
        return process.env[`JWKS_PUBLIC_KEY_METADATA`];
    }

    /**
     * Get the JWKS private key metadata for this server
     * @param kid
     */
    public getJwksPrivateKey(kid: string): string {
        const metadataObj = JSON.parse(process.env[`JWKS_PRIVATE_KEY_METADATA`]);

        return JSON.stringify(metadataObj.keys.find(k => k.kid === kid));
    }
}

const JwksProviderInstance = new JwksProviderImpl();
export default JwksProviderInstance;
