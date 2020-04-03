import DBServiceInstance from './db.service';
import {WhitelistRecord, OAuthRecord} from 'fastfed-node-sdk';
import {IDBServiceInitializer} from './dbserviceIntializer.interface';

/**
 * Service for interacting with the whitelist table
 */
class WhitelistService implements IDBServiceInitializer {

    private static readonly TABLE_NAME = 'whitelist';

    public constructor() {
        DBServiceInstance.register(this);
    }

    /**
     * Add a whitelisted entry for a particular provider to the DB
     * @param whitelist the WhitelistRecord to add to the DB
     * @return the created record
     */
    public add(whitelist: WhitelistRecord) {
        const exists: boolean = (this.get(whitelist.getEntityId()) != null);

        if (exists) {
            throw new Error('The whitelisted record already exist for this entity id: ' + whitelist.getEntityId());
        }

        this.getWhitelistCollection().insert(whitelist, {
            indicies: ['entityId']
        });

        return whitelist;
    }

    /**
     * Retrieve application credentials for a given provider
     */
    public get(entityId: string): WhitelistRecord {

        const whitelistCollection = this.getWhitelistCollection();

        const result = whitelistCollection.findOne(
            {
                entityId: entityId
            }
        );

        return result ? this.toWhitelistRecord(result) : null;
    }

    public getAll(): WhitelistRecord[] {
        return this.getWhitelistCollection()
            .data
            .map(w => this.toWhitelistRecord(w));
    }

    /**
     * Update whitelist record for a given provider
     */
    public update(whitelistRecord: WhitelistRecord) {

        const whitelistCollection = this.getWhitelistCollection();
        const foundDbRecord = this.find(whitelistRecord.getEntityId());

        if (!foundDbRecord) {
            throw new Error('Unable to update the whitelist record because it does not exist')
        }

        foundDbRecord.data = {
            ...foundDbRecord.data,
            ...whitelistRecord
        };

        whitelistCollection.update(foundDbRecord);
    }

    public remove(entityId: string) {
        const foundDbRecord = this.find(entityId);
        if (foundDbRecord) {
            this.getWhitelistCollection().remove(foundDbRecord);
        }
    }

    public init() {
        if (!this.getWhitelistCollection()) {
            DBServiceInstance.getDatabase().addCollection(WhitelistService.TABLE_NAME, {
                unique: ['entityId']
            });
        }
    }

    private find(entityId: string) {
        return this.getWhitelistCollection().findOne(
            {
                entityId: entityId
            }
        );
    }

    private getWhitelistCollection() {
        return DBServiceInstance.getCollection(WhitelistService.TABLE_NAME);
    }

    private toWhitelistRecord(dbRecord: any): WhitelistRecord {
        const whitelistRecord = new WhitelistRecord(dbRecord.entityId, dbRecord.domain,
            dbRecord.identityProviderJwksUri, dbRecord.metadata, dbRecord.expirationDate);

        whitelistRecord.setErrorMessage(dbRecord.errorMessage);
        whitelistRecord.setCompleted(dbRecord.isCompleted);
        whitelistRecord.setSuccess(dbRecord.isSuccess);

        if (dbRecord.oauth) {
            whitelistRecord.setOAuthRecord(
                new OAuthRecord(dbRecord.oauth.accessToken, dbRecord.oauth.expiresIn, dbRecord.oauth.tokenType));
        }

        return whitelistRecord;
    }
}

// global service instance
const WhitelistServiceInstance = new WhitelistService();
export default WhitelistServiceInstance;
