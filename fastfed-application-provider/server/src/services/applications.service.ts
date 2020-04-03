import DBServiceInstance from './db.service';
import {OAuthRecord} from 'fastfed-node-sdk';
import {IDBServiceInitializer} from './dbserviceIntializer.interface';

/**
 * Service for interacting with the applications table.   Major quick hack to store application oAuth
 * data for IdPs that have registered with this app provider
 */
class ApplicationsService implements IDBServiceInitializer {

    private static readonly TABLE_NAME = 'applications';

    public constructor() {
        DBServiceInstance.register(this);
    }

    /**
     * Add a applicationsed entry for a particular provider to the DB
     * @return the created record
     * @param entityId
     * @param oauthRecord
     */
    public add(entityId: string, oauthRecord: OAuthRecord) {
        const record = this.get(entityId);
        if (record) {
            this.getApplicationCollection().remove(record);
        }

        this.getApplicationCollection().insert({
            entityId: entityId,
            oauth: oauthRecord
        }, {
            indicies: ['entityId']
        });
    }

    /**
     * Retrieve application credentials for a given provider
     */
    public get(entityId: string): object {

        const collection = this.getApplicationCollection();

        const result = collection.findOne(
            {
                entityId: entityId
            }
        );

        return result ? this.toApplicationRecord(result) : null;
    }

    /**
     * Retrieve application credentials for a given provider
     */
    public getAll(): [] {
        return this.getApplicationCollection()
            .data
            .map(dbRecord => this.toApplicationRecord(dbRecord));
    }


    public init() {
        if (!this.getApplicationCollection()) {
            DBServiceInstance.getDatabase().addCollection(ApplicationsService.TABLE_NAME, {
                unique: ['entityId']
            });
        }
    }

    private getApplicationCollection() {
        return DBServiceInstance.getCollection(ApplicationsService.TABLE_NAME);
    }

    private toApplicationRecord(dbRecord: any): object {

        let oauthRecord: object = null;
        if (dbRecord.oauth) {
            oauthRecord = new OAuthRecord(dbRecord.oauth.accessToken, dbRecord.oauth.expiresIn, dbRecord.oauth.scope);
        }

        return {
            entityId: dbRecord.entityId,
            oauth: oauthRecord
        };
    }
}

// global service instance
const ApplicationsServiceInstance = new ApplicationsService();
export default ApplicationsServiceInstance;
