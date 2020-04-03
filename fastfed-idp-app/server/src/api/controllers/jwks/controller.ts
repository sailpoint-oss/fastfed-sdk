import * as FastFedSDK from 'fastfed-node-sdk';
import { JwksProviderInstance } from '../../../providers/jwks.provider';

/*
JWKS controller
 */
export class Controller {

    private jwksService: FastFedSDK.JwksService;

    constructor() {
        console.debug('JWKS controller constructor');
        this.jwksService = new FastFedSDK.JwksService(JwksProviderInstance)
    }

    /*
    Get the JWKS metadata
     */
    public get(req, res) {
        const metadata =  this.jwksService.get();
        res.send(metadata);
    }
}

export default new Controller();
