import express from 'express';
import controller from './controller'
import passport from 'passport';

/*
Class that defines the routes (api) for the SAML endpoint
 */
export default express.Router()
    .get('/metadata', (req, res) => controller.getSamlMetadata(req, res))
    .post('/login',
        passport.authenticate('saml'),
        (req: any, res, next) => {
            if (req.session.redirectUrl) {

                const url = (req.session.redirectUrl || '/index.html');
                delete req.session.redirectUrl;

                return res.redirect(url);
            }

            return res.send(`<p>authenticated as user: </p><pre>${JSON.stringify(req.user, null, 4)}</pre>`);
        }
    )
    .get('/logout', (req: any, res) => {
        if (req.user == null) {
            return res.redirect('/sso');
        }

        return passport.SamlStrategy.logout(req, function (err, uri) {
            return res.redirect(uri);
        });
    })
