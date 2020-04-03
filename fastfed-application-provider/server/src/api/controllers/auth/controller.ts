import {OAuthRecord} from 'fastfed-node-sdk';
import {AuthService} from '../../../services/auth.service';
import LOG from '../../../common/logger'

/*
Controller for all of the FastFed functionality

*/
export class Controller {

    private authService: AuthService;

    constructor() {
        console.debug('FastFed authentication controller constructor');
        this.authService = new AuthService();
    }

    /**
     * Get an oauth bearer token based on grant type
     * @param req the request
     * @param res the response
     */
    public async authenticate(req, res) {

        const bearer = {};

        try {
            const token = req.query.assertion;
            const bearer: OAuthRecord = await this.authService.getOAuthRecord(token);

            return res.send(bearer.toJson());
        } catch (err) {
            LOG.error(err);
        }


        return res.sendStatus(400);
    }
}

export default new Controller();
