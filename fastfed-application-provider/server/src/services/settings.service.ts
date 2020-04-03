import DBServiceInstance from './db.service';
import {FastFedAuthenticationObject} from 'fastfed-node-sdk';
import {IDBServiceInitializer} from './dbserviceIntializer.interface';

/**
 * Service for interacting with settings related API
 */
class SettingsService implements IDBServiceInitializer {

    private static readonly TABLE_NAME = 'settings';
    private static readonly SSO = 'sso';

    public constructor() {
        DBServiceInstance.register(this);
    }

    /**
     * Add a applicationsed entry for a particular provider to the DB
     * @return the created record
     * @param ssoSettings
     */
    public addSSO(ssoSettings: FastFedAuthenticationObject) {

        const dbRecord = this.getSettingsCollection().findOne(
            {
                settings_type: SettingsService.SSO
            }
        );

        if (dbRecord) {
            this.getSettingsCollection().remove(dbRecord);
        }

        this.getSettingsCollection().insert({
            settings_type: SettingsService.SSO,
            settings: ssoSettings
        }, {
            indicies: ['settings_type']
        });
    }

    /**
     * Retrieve sso settings for this app
     */
    public getSSO(): object {

        const collection = this.getSettingsCollection();

        const ssoSettings = collection.findOne(
            {
                settings_type: SettingsService.SSO
            }
        );

        return ssoSettings ? this.toSettingsRecord(ssoSettings) : null;
    }


    public init() {
        if (!this.getSettingsCollection()) {
            DBServiceInstance.getDatabase().addCollection(SettingsService.TABLE_NAME, {
                unique: ['entityId']
            });
        }
    }

    private getSettingsCollection() {
        return DBServiceInstance.getCollection(SettingsService.TABLE_NAME);
    }

    private toSettingsRecord(dbRecord: any): object {
        return dbRecord.settings;

    }
}

// global service instance
const SettingsServiceInstance = new SettingsService();
export default SettingsServiceInstance;
