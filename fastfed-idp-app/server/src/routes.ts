import {Application} from 'express';
import fastFedRouter from './api/controllers/fastfed/router';
import SamlRouter from './api/controllers/saml/router';
import jwksRouter from './api/controllers/jwks/router';
import passport from 'passport';
import express from 'express';
import path from 'path';
import session from 'express-session';
import bodyParser from 'body-parser';
import Utils from './common/utils';
import {createProxyMiddleware} from 'http-proxy-middleware';

/*
Class to define all of the routes, api endpoints, etc.
 */
export default function routes(app: Application, serverRootFolder: string, isProd: boolean): void {

    app.use(session({
        secret: process.env.SESSION_SECRET_ID || 'fastfed-idp-app',
        cookie: {
            maxAge: 60000
        }
    }));

    // setup passport and the passport session so we can eventually initialize SAML
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    app.use(bodyParser.json({
        limit: process.env.REQUEST_LIMIT || '100kb'
    }));
    app.use(bodyParser.urlencoded({
        extended: true, limit: process.env.REQUEST_LIMIT || '100kb'
    }));
    app.use(bodyParser.text({
        limit: process.env.REQUEST_LIMIT || '100kb'
    }));

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    app.use('/saml', SamlRouter);
    app.use('/jwks', jwksRouter);
    app.use('/fastfed', fastFedRouter);

    app.get('/sso', passport.authenticate('saml'));

    if (!isProd) {
        const proxyMiddleware = createProxyMiddleware({
            target: 'http://127.0.0.1:4201/',
            headers: {
                'Connection': 'keep-alive'
            }
        });

        // static content served from the running app client on port 4201
        app.all('*',
            Utils.ensureAuthenticated,
            proxyMiddleware
        );
    } else {
        app.use(express.static('app'));
    }
}

