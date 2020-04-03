import express from 'express';
import {Application} from 'express';
import path from 'path';
import http from 'http';
import os from 'os';
import LOG from './logger';
import SamlServiceInstance from '../services/saml.service';

const app = express();

export default class ExpressServer {

    private _rootFolder: string;
    private _isProd: boolean;
    private proxyServer;

    get rootFolder(): string {
        return this._rootFolder;
    }

    get isProd(): boolean {
        return this._isProd;
    }

    constructor() {

        this._rootFolder = path.dirname(require.main.filename);
        console.log(`root folder: ${this._rootFolder}`);

        this.initEnvironment();
    }

    private initEnvironment() {
        this._isProd = ((process.env.NODE_ENV || 'development').toLowerCase() === 'production');

        SamlServiceInstance.init()
            .then(() => LOG.debug('SamlService initialized'));
    }

    router(routes: (app: Application, serverRootFolder: string, isProd: boolean) => void): ExpressServer {
        routes(app, this.rootFolder, this._isProd);

        return this;
    }

    listen(p: string | number = process.env.PORT): Application {
        const welcome = port => () => LOG.info(`up and running in ${process.env.NODE_ENV || 'development'} @: ${os.hostname()} on port: ${port}}`);
        http.createServer(app)
            .listen(p, welcome(p));

        return app;
    }
}
