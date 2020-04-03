import {IJwksProvider} from 'fastfed-node-sdk';
import jose from 'jose';

export class JwksProvider implements IJwksProvider {


    public getMetadata(): any {
        const keyStore = jose.JWKS.asKeyStore(this.getPrivateKeySet());
        return JSON.stringify(keyStore.toJWKS(false));
    }

    /**
     * Get the JWKS private key metadata for this server
     * @param kid
     */
    public getJwksPrivateKey(kid: string): string {
        const metadataObj = this.getPrivateKeySet();
        return JSON.stringify(metadataObj.keys.find(k => k.kid === kid));
    }

    private getPrivateKeySet() : any {
        // TODO:  move to the SDK configuration class
        return JSON.parse(process.env[`JWKS_PRIVATE_KEY_METADATA`]);
    }
}

export let JwksProviderInstance = new JwksProvider();
