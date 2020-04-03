import LOG from '../logger'
import requestPromise from 'request-promise-native';


export class WebFingerService {

    public constructor() {
    }

    /**
     * Gets WebFinger metadata for a specific account
     *
     * @param account the email address of the WebFinger entity
     * @param webFingerUrl well-known endpoint for the WebFinger metadata
     * @return
     * @throws ParseException
     */
    private async getWebFingerMetadata(account: string, webFingerUrl: string) {
        LOG.debug("entered getWebFingerMetadata");

        if (!webFingerUrl) {
            throw "Invalid metadata URI specified.";
        }

        // query the fastfed metadata from the passed in uri.  we don't have an actual webfinger
        // server, so the resource/rel won't do anything
        return await requestPromise({
            uri: `${webFingerUrl}?resource=${account}&rel=http://openid.net/specs/fastfed/1.0/provider`,
            json: true,
            rejectUnauthorized: false   // TODO - should only be set for dev to allow self signed certs
        });
    }

    /**
     * Initialize the service by obtaining the fastfed metadata through WebFinger discovery
     */
    public async getFastfedMetadataUrls(account: string): Promise<string[]> {

        LOG.debug("getFastfedMetadataUrl called");

        let fastfedMetadataUrls: string[] = [];

        const webFingerUrl: string = process.env.WEBFINGER_URL;
        if (!webFingerUrl) {
            throw new Error("WebFinger url not specified in the current environment.");
        }
        LOG.debug(`webFingerUrl: ${webFingerUrl}`);

        const webFingerMetadata: any = await this.getWebFingerMetadata(account, webFingerUrl);
        if (webFingerMetadata) {

            // For now, assume webfinger server is real and that we'd get a unique subject back
            fastfedMetadataUrls = webFingerMetadata.links
                .filter(l => l.rel === "http://openid.net/specs/fastfed/1.0/provider")
                .map(l => l.href);
        }

        return fastfedMetadataUrls;
    }


}
