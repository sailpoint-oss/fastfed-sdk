import {IWhitelistProvider, WhitelistRecord} from 'fastfed-node-sdk';
import WhitelistService from '../services/whitelist.service';

class WhitelistProviderImpl implements IWhitelistProvider {

    public get(entityId: string): WhitelistRecord {
        return WhitelistService.get(entityId);
    }

    public add(whitelistRecord: WhitelistRecord) {
        WhitelistService.add(whitelistRecord);
    }

    public update(whitelistRecord: WhitelistRecord) {
        WhitelistService.update(whitelistRecord);
    }

    public remove(entityId: string) {
        WhitelistService.remove(entityId);
    }
}

const WhitelistProviderInstance = new WhitelistProviderImpl();
export default WhitelistProviderInstance;
