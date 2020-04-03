
import dotenv from 'dotenv';
import LOG from './common/logger';

process.env.PORT = (process.env.PORT || '8012');

// configuring the dotenv must be done before anything else
// done with the ExpressServer class
let configFile = `./environment/dev.env`;
if (this._isProd) {
    configFile = `./environment/production.env`;
}
const result = dotenv.config({path: configFile});
if (result.error) {
    throw result.error;
}

LOG.debug(result.parsed);

import ExpressServer from './common/server';
import routes from './routes';

/*
The entry point into the server
 */
export default new ExpressServer()
    .router(routes)
    .listen(process.env.PORT);
