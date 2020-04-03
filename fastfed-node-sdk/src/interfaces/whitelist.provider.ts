import {WhitelistRecord} from "../model/whitelistRecord.model";

/**
 * Interface for a whitelisting provider to implement for some data store
 */
export interface IWhitelistProvider {
    get(entityId: string): WhitelistRecord;
    add(whitelistRecord: WhitelistRecord);
    update(whitelistRecord: WhitelistRecord);
    remove(entityId: string);
}
