import LokiJS from 'lokijs';
import {IDBServiceInitializer} from './dbserviceIntializer.interface';

class DbService {

    private dbName: string;
    private dbPath: string;
    private database: LokiJS;
    private initializers: IDBServiceInitializer[] = [];

    constructor() {
        this.dbName = 'app.db';

        // TODO: need to create the proper folder.  this will be different if debugging in IDE vs running from dist
        this.dbPath = `${this.dbName}`;

        this.ensureDatabase();
    }

    /**
     * Get the database
     */
    public getDatabase(): LokiJS {
        return this.database;
    }

    public register(service: IDBServiceInitializer) {
        this.initializers.push(service);
    }



    public save() {
        this.database.save();
    }

    /**
     * Get a collection of data (table)
     * @param collectionName
     */
    public getCollection(collectionName: string): LokiJS.Collection {
        return this.getDatabase().getCollection(collectionName);
    }

    /**
     * Ensure the DB is set up correctly
     */
    private ensureDatabase() {

        const handler = this.autoLoadHandler.bind(this);
        this.database = new LokiJS(this.dbPath, {
            env: 'NODEJS',
            autoload: true,
            autoloadCallback: handler,
            autosave: true,
            autosaveInterval: 4000, // 4 seconds
            adapter: new LokiJS.LokiFsAdapter()
        });
    }

    private autoLoadHandler() {
        console.log('LokiJS autoLoaderHandler called.');

        // init the services that asked to be initialized
        this.initializers.forEach(
            i => i.init()
        );

        // force the DB to save (this seems to be only way to have it create a new DB file)
        this.database.save();
    }
}

// singleton database instance
const DBServiceInstance = new DbService();
export default DBServiceInstance;
