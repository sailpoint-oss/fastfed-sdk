import requestPromise from 'request-promise-native';

export class Helpers {
    /**
     * Gets the FAstFed metadata from the application provider supplied endpoint
     * @param metadataUrl the url to the metadata
     * @param key the JSON key of the object to retrieve (application_provider | identity_provider)
     */
    public static async getFastFedMetadata(metadataUrl: string, key: string): Promise<object> {

        let metadata: object = null;

        if (!metadataUrl) {
            throw "Invalid metadata URI specified.";
        } else {

            // query the fastfed metadata from the passed in uri
            metadata = await requestPromise({
                uri: metadataUrl,
                json: true,
                rejectUnauthorized: false   // TODO - should only be set for dev to allow self signed certs
            });
            metadata = metadata[key];
        }

        return metadata;
    }
}
