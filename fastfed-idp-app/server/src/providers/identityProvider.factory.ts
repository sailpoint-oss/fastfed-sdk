import * as Providers from './identityProviders';

class IdentityProviderFactory {

    public static loadProvider(className: string, ...args: any[]) {
        return new (<any>Providers)[className](...args);
    }
}

export let IdentityProviderInstance =  IdentityProviderFactory.loadProvider(
    process.env.IdentityProviderClassName || 'KeycloakIdentityProvider');
