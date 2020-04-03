import * as FastFedSDK from 'fastfed-node-sdk';
import LOG from '../../../common/logger'
import WhitelistServiceInstance from '../../../services/whitelist.service';
import ApplicationsServiceInstance from '../../../services/applications.service';
import SettingsServiceInstance from '../../../services/settings.service';

/*
Controller for the general app functionality
*/
export class Controller {

    constructor() {
        console.debug('FastFed app controller constructor');
    }

    /**
     * Consent to using an Idp/Governance as a valid provider.  This should be called after an administrator
     * consents to allowing the application provider to access a IdP/Governance provider's intersected capabilities
     */
    public async consent(req, res) {

        let status = 200;

        try {
            // idp/gov provider url to their fastfed metadata
            const discoveryResult: FastFedSDK.DiscoveryResult = req.body;
            if (!discoveryResult) {
                return res.status(400).send('No discovery result object in the posted data');
            }

            // save ONLY the common capabilities.  we will overwrite the capabilities on the fastfed metadata
            // that will be stored to the whitelist with the commonCapabilities object.
            // TODO:  revisit this.  def a better way to do this so that it is clearer what is going on.

            (discoveryResult.fastFedMetadata as any).capabilities = discoveryResult.commonCapabilities;

            const whitelistRecord: FastFedSDK.WhitelistRecord =
                FastFedSDK.WhitelistService.fromFastFedProviderMetadata(discoveryResult.fastFedMetadata);

            // if there is a whitelist already pending, they need to clean it up through the UI's pending handshakes section because
            // the whitelisted handshake in progress.  They are also responsible for having cleaned up anything
            // on the IdP side, etc.  So remove it and then add the new whitelist record
            if (discoveryResult.isWhitelistPending) {
                if (process.env.DEBUG_AUTO_REMOVE_WHITELIST) {
                    WhitelistServiceInstance.remove(discoveryResult.entityId);
                } else {
                    throw new Error('There is a pending FastFed handshake in progress.  Please correct and try again!');
                }
            }

            WhitelistServiceInstance.add(whitelistRecord);

        } catch (err) {
            LOG.error(err);
            status = 400;
        }

        return res.status(status).end();
    }

    public async getApps(req, res): Promise<[]> {
        return res.send(ApplicationsServiceInstance.getAll() || []);
    }

    public async getSsoSettings(req, res): Promise<any> {
        const settings: any = SettingsServiceInstance.getSSO();

        // if (settings) {
        //     settings.authMetadataAsJson = xml2json(settings, {compact: false, spaces: 4});
        // }

        return res.send(settings || {})
    }
}

export default new Controller();
