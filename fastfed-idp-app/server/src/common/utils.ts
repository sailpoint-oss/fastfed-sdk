export default class Utils {
    public static ensureAuthenticated(req, res, next): void {

        if (req.isAuthenticated() || process.env.BYPASS_SAML_AUTH === '1') {
            return next();
        }

        // save the original request url off for redirect after login
        req.session.redirectUrl = req.originalUrl;

        return res.redirect(`/sso`);
    }

    public static getDomain(addProtocol: boolean = true) {

        let domain = `idp:${process.env.ANGULAR_CLI_PORT || process.env.PORT}`;
        if (addProtocol) {
            domain = `${(process.env.PROTOCOL || 'https')}://${domain}`
        }

        return domain;
    }
}
