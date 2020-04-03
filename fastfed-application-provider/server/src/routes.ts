import {Application} from 'express';
import fastFedRouter from './api/controllers/fastfed/router';
import samlRouter from './api/controllers/saml/router';
import jwksRouter from './api/controllers/jwks/router';
import oauthRouter from './api/controllers/auth/router';
import appRouter from './api/controllers/app/router'
import passport from 'passport';
import express from 'express';
import session from 'express-session';
import path from 'path';
import Utils from './common/utils';
import {createProxyMiddleware} from 'http-proxy-middleware';
import bodyParser from 'body-parser';

/*
Class to define all of the routes, api endpoints, etc.
 */
export default function routes(app: Application, serverRootFolder: string, isProd: boolean): void {

    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Allow-Methods', '*');
        next();
    });

    app.use(session({
        secret: process.env.SESSION_SECRET_ID || 'fastfed-application-provider',
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


    // quick and dirty to simulate a WebFinger server.
    app.get('/.well-known/webfinger', (req: any, res, next) => {
        let message = null;

        // hack for now to support both Atlas app and Governed app since we don't have a WebFinger server
        const acct: string = req.query['resource'];
        if (acct === 'acct:idp@example.com') {
            message = {
                subject: 'idp@example.com',
                links: [
                    {
                        rel: 'http://openid.net/specs/fastfed/1.0/provider',
                        href: `${process.env.IDP_FASTFED_ENDPOINT}`
                    },
                    {
                        rel: 'http://openid.net/specs/fastfed/1.0/provider',
                        href: `${process.env.GOV_FASTFED_ENDPOINT}`
                    }
                ]
            }
        } else {
            message = {
                subject: 'acct:app@example.com',
                links: [
                    {
                        rel: 'http://openid.net/specs/fastfed/1.0/provider',
                        href: `${process.env.LOCAL_FASTFED_ENDPOINT}`
                    }
                ]
            }
        }

        res.send(message);
    });

    // auth endpoints
    app.use('/oauth/', oauthRouter);

    // common app endpoints
    app.use('/common/', appRouter);

    // the fastfed endpoints
    app.use('/fastfed/',
        (req: any, res, next) => {
            req.session.redirectUrl = req.originalUrl;
            next();
        },
        fastFedRouter
    );

    // JWKS related endpoints
    app.use('/jwks/', jwksRouter);

    // SAML related endpoints
    app.use('/saml/', samlRouter);
    //
    app.get('/sso', passport.authenticate('saml'));

    if (!isProd) {
        const proxyMiddleware = createProxyMiddleware({
            target: 'http://127.0.0.1:4200/',
            headers: {
                'Connection': 'keep-alive'
            }
        });

        // static content served from the running app client on port 4201
        app.all('*',
            // Utils.ensureAuthenticated,
            proxyMiddleware
        );
    } else {
        app.use(express.static('app'));
    }
}
