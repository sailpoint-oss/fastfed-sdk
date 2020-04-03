import * as FastFedSDK from 'fastfed-node-sdk';
import LOG from '../../../common/logger';
import {response, Response} from 'express';
import {IdentityProviderInstance} from '../../../providers/identityProvider.factory'
import {JwksProviderInstance} from '../../../providers/jwks.provider';
import Utils from '../../../common/utils';
import DBServiceInstance from '../../../services/db.service';

/*
Controller for all of the FastFed functionality

*/
export class Controller {

    private static readonly TABLE_NAME = 'ApplicationProviders';
    private fastfedService: FastFedSDK.FastFedService;

    constructor() {
        console.debug('FastFed controller constructor');

        this.fastfedService = new FastFedSDK.FastFedService(
            new FastFedSDK.IdPService(IdentityProviderInstance, JwksProviderInstance),
            null
        );

        if (!this.getCollection()) {
            LOG.debug(`Created database table: ${Controller.TABLE_NAME}`);
            DBServiceInstance.getDatabase().addCollection(Controller.TABLE_NAME,
                {
                    unique: ['entityId']
                });
            DBServiceInstance.save();
        }
    }

    /**
     Get this provider's FastFed metadata
     */
    public getMetadata(req, res) {
        res.send(this.fastfedService.getMetadata());
    }

    public async start(req, res, next) {
        try {
            if (!req.query.app_metadata_uri) {
                throw new Error('app metadata url is missing!')
            }

            req.session.providerMetadataUrl = req.query.app_metadata_uri;

            // const metadata: any = await FastFedSDK.Helpers.getFastFedMetadata(req.query.app_metadata_uri,
            //     FastFedSDK.SdkConstants.APPLICATION_PROVIDER);
            //
            // this.add(metadata.entity_id, req.query.app_metadata_uri);

            // return res.redirect(`${Utils.getDomain()}?eid=${metadata.entity_id}`);


            // for now redirect to root.  the client angular app needs to be running.  need to fix this
            return res.redirect('http://idp:8012/');
            // return res.sendStatus(200);

        } catch (err) {
            LOG.error(err);
            next(err);
        }
    }

    private getCollection() {
        return DBServiceInstance.getCollection(Controller.TABLE_NAME)
    }

    /**
     * Get the information that the UI needs to show duplicates and consent information to the admin
     * @param req
     * @param res
     */
    public async getConfirmationRequirements(req, res, next) {

        let confirmationReqs: FastFedSDK.IdpConfirmationResult =
            new FastFedSDK.IdpConfirmationResult();

        try {

            // const entityId = req.params.entityId;
            // if (!entityId) {
            //     throw new Error("The application provider did not have an entityId specified.");
            // }
            //
            // const foundRecord: any = this.get(entityId);
            // if (!foundRecord) {
            //     throw new Error(`No db record found for entityId: ${entityId}`);
            // }
            //
            // confirmationReqs = await this.fastfedService.getIdPService()
            //     .getConfirmationRequirements(foundRecord.data.providerMetadataUrl);


            // during dev, use this url if no session state
            const url = req.session.providerMetadataUrl;
            confirmationReqs = await this.fastfedService.getIdPService()
                .getConfirmationRequirements(url);

            res.send(confirmationReqs);

        } catch (err) {
            LOG.error(err);
            next(err);
        }
    }

    /**
     * Kicks off the FastFed process.
     * This is where all of the magic happens.  This is the full handshake, from start to finalize.
     */
    public async postConsentContinue(req, res, next) {

        try {

            // TODO: some backing store with a consent flag for the app provider's entityId?  Check that here to make
            // sure actually consented?

            // TODO: differentiate types of errors
            const idpConfirmationResults: any = req.body;
            await this.fastfedService.getIdPService()
                .handshakeStart(idpConfirmationResults.fastFedMetadata);

            // TODO:  revisit.  semi-hack for now.  add as a relying party
            this.add(idpConfirmationResults.entityId, req.session.providerMetadataUrl);

            res.sendStatus(200);
        } catch (err) {
            LOG.error(err);
            next(err);
        }
    }


    /**
     * Add a app provider url to DB
     */
    public add(entityId: string, providerMetadataUrl: string) {
        const foundDBRecord = this.get(entityId);

        if (foundDBRecord) {
            LOG.debug(`Found ApplicationProviders DB record for entityId: ${entityId}.  Removing ...`);
            this.getCollection().remove(foundDBRecord)
        }

        this.getCollection().insert({
            entityId: entityId,
            providerMetadataUrl: providerMetadataUrl,
            consented: false
        }, {
            indicies: ['entityId']
        });
        LOG.debug(`Inserted record with entityId ${entityId} ApplicationProviders DB record.`);
        DBServiceInstance.save();
    }

    /**
     * Retrieve application credentials for a given provider
     */
    public get(entityId: string): object {

        return this.getCollection().findOne(
            {
                entityId: entityId
            }
        );
    }

    public getRelyingParties(req, res, next) {

        const parties = [];
        this.getCollection()
            .data
            .map(d => parties.push({
                    entityId: d.entityId,
                    providerMetadataUrl: d.providerMetadataUrl
                })
            );

        res.send(parties);
    }

}

export default new Controller();
