import * as FastFedSDK from 'fastfed-node-sdk';
import LOG from '../../../common/logger'
import FastFedProviderInstance from '../../../providers/application.provider.impl'
import JwksProviderInstance from '../../../providers/jwks.provider.impl';
import WhitelistProviderInstance from '../../../providers/whitelist.provider.impl';
import ApplicationProviderInstance from '../../../providers/application.provider.impl';
import WhitelistServiceInstance from '../../../services/whitelist.service';

/*
Controller for all of the FastFed functionality

*/
export class Controller {

    private static readonly ERROR_STATUS: number = 500;
    private fastfedService: FastFedSDK.FastFedService;

    constructor() {
        LOG.debug('FastFed controller constructor');

        this.fastfedService = new FastFedSDK.FastFedService(
            null,
            new FastFedSDK.ApplicationProviderService(ApplicationProviderInstance, WhitelistProviderInstance, JwksProviderInstance)
        );
    }

    /**
     Get this provider's FastFed metadata
     */
    public getMetadata(req, res, next) {

        let response: object;

        try {
            response = this.fastfedService.getMetadata();
            res.status(200).send(response).end();
        } catch (err) {
            LOG.error(err);
            return next(err);
        }
    }

    /**
     * Removes the POC Demo app from the ADFS relying party trust store.
     * TODO: Currently in place during development/testing - possibly remove
     */
    public async removeAuthenticationProfile(req, res, next) {

        try {
            const serviceProviderName = req.params['name'];
            await FastFedProviderInstance.removeAuthenticationApplication(serviceProviderName);

            return res.sendStatus(200).end();
        } catch (err) {
            LOG.error(err);
            return next(err);
        }
    }

    public async register(req, res, next) {

        let response: object;

        try {
            const token: string = req.body;
            response = await this.fastfedService.getApplicationProviderService()
                .handshakeRegister(token);

            res.status(200).send(response).end();
        } catch (err) {
            LOG.error(err);
            return next(err);
        }


    }

    public async finalize(req, res, next) {

        try {
            const token: string = req.body;
            await this.fastfedService.getApplicationProviderService()
                .handshakeFinalize(token);
        } catch (err) {
            LOG.error(err);
            return next(err);
        }

        res.sendStatus(200).end();
    }

    public async discovery(req, res, next) {

        try {
            const type: string = req.params['type'];

            const discoveryType: FastFedSDK.DiscoveryType = FastFedSDK.DiscoveryType[<string>type];
            const account = req.query['account'];
            const fastfedUrl = req.query['fastfedUrl'];

            const results: FastFedSDK.DiscoveryResult[] =
                await this.fastfedService.getApplicationProviderService()
                    .discovery(discoveryType, account, fastfedUrl);

            res.status(200).send(results).end();

        } catch (err) {
            LOG.error(err);
            return next(err);
        }


    }

    public async getWhitelist(req, res, next) {

        try {
            const whitelist = WhitelistServiceInstance.getAll();

            res.status(200).send(whitelist).end();

        } catch (err) {
            LOG.error(err);
            return next(err);
        }
    }

    public async removeWhitelist(req, res, next) {
        try {
            WhitelistServiceInstance.remove(req.params.entityId)
        } catch (err) {
            LOG.error(err);
            return next(err);
        }

        res.status(200).end();
    }
}

export default new Controller();
