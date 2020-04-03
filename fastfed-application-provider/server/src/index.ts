import ExpressServer from './common/server';
import routes from './routes';

const port = parseInt(process.env.PORT || '8010');

/*
The entry point into the server
 */
export default new ExpressServer()
    .router(routes)
    .listen(port);
