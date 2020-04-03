import SamlServiceInstance from '../../../services/saml.service';
import { Request, Response } from 'express';

/*
SAML controller
 */
export class Controller {
  /*
  Get the SAML metadata for this server
   */
  getSamlMetadata(req: Request, res: Response): void {
    res.write(SamlServiceInstance.getMetadata());
    res.end();
  }
}
export default new Controller();
