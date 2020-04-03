/**
 * Interface for a jwks provider to implement for their JWKS endpoint
 */
export interface IJwksProvider {
    /**
     * Get the JWKS metadata for this provider
     */
    getMetadata(): string;
    
    /**
     * Get a JWKS provate key for a particular KeyId
     * @param kid the key id of the private key to return
     */
    getJwksPrivateKey(kid: string): string;
}
