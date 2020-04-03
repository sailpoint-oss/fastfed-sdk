import express from 'express';
import {Application} from 'express';
import session from 'express-session';
import path from 'path';
import bodyParser from 'body-parser';
import http from 'http';
import os from 'os';
import dotenv from 'dotenv';
import LOG from './logger';
import SamlServiceInstance from '../services/saml.service';


const app = express();

export default class ExpressServer {

    private readonly _rootFolder: string;
    private _isProd: boolean;

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

        let configFile = `${this._rootFolder}/environment/dev.env`;
        if (this._isProd) {
            configFile = `${this._rootFolder}/environment/production.env`;
        }
        const result = dotenv.config({path: configFile});
        if (result.error) {
            throw result.error;
        }

        SamlServiceInstance.init(this._rootFolder);

        LOG.debug(result.parsed);
    }

    router(routes: (app: Application, serverRootFolder: string, isProd: boolean) => void): ExpressServer {
        routes(app, this._rootFolder, this.isProd);

        return this;
    }

    listen(p: string | number = process.env.PORT): Application {
        const welcome = port => () => LOG.info(`up and running in ${process.env.NODE_ENV || 'development'} @: ${os.hostname()} on port: ${port}}`);
        http.createServer(app)
            .listen(p, welcome(p));

        return app;
    }
}
