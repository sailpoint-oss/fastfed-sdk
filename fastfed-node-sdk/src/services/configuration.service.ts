export class ConfigurationService {

    /**
     * Get the full application domain including tenant.  This will also allow returning just the domain when the TENANT_ID
     * is an empty string (can't be null though) so that localhost will work
     */
    public static getApplicationServerName(): string {
        let domain = ConfigurationService.getDomain();
        if (!ConfigurationService.isLocalhost() && ConfigurationService.getTenantId()) {
            domain = ConfigurationService.getTenantId() + '.' + domain;
        }

        return domain;
    }

    public static getApplicationDisplayName(): string {
        return process.env.APP_DISPLAY_NAME;
    }

    public static getDomain(): string {
        return process.env.DOMAIN;
    }

    public static getTenantId(): string {
        return process.env.TENANT_ID;
    }

    public static getFastFedProtocol(): string {
        return (process.env.FASTFED_PROTOCOL || "https");
    }

    public static getJwksProtocol(): string {
        return (process.env.JWKS_PROTOCOL || "https");
    }

    public static getSamlProtocol(): string {
        return (process.env.SAML_PROTOCOL || "https");
    }

    public static getEntityId(): string {
        return process.env.ENTITY_ID;
    }

    public static isLocalhost(): boolean {
        return ConfigurationService.getDomain().startsWith("localhost");
    }

    public static getWhitelistExpirationHours(): number {
        return parseInt((process.env.WHITELIST_EXPIRATION_HOURS || (24 * 7).toString()));
    }

    public static getJwtTokenExpirationMinutes() {
        return parseInt(process.env.JWT_EXPIRATION_MINUTES || "10");
    }
}

