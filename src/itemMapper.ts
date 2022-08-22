import { Item } from '../pantry-shared/src/item';
import { PantryItem } from '../pantry-shared/src/pantryItem';
import { Account } from './account';
import { MongoClient, ObjectId } from 'mongodb';

// Required to pull data from the .env file
import dotenv from 'dotenv';
import path from 'path';
const envPath = path.join(__dirname, '..', '../.env');
dotenv.config({ path: envPath });

const DB_USER = process.env.DB_ADMIN_USER;
const DB_PASS = process.env.DB_ADMIN_PASS;
const DATABASE_URI =
    `mongodb+srv://${DB_USER}:${DB_PASS}` +
    `@cluster0.q4vjj.mongodb.net/pantry-db-dummy?retryWrites=true&w=majority`;

export class ItemMapper {
    databaseClient: MongoClient;
    databaseName: string;
    collectionName: string;

    constructor(databaseName: string, collectionName: string) {
        this.databaseClient = new MongoClient(DATABASE_URI);

        this.databaseName = databaseName;
        this.collectionName = collectionName;
    }

    async createItem(item: Item, account: Account) {
        await this.databaseClient.connect();
        const collection = this.databaseClient
            .db(this.databaseName)
            .collection(this.collectionName);

        let document = {
            _id: new ObjectId(),
            accountId: account.id,

            name: item.getName(),
            brand: item.getBrand(),
            calories: item.getCalories(),
            vendorPrices: item.getVendorPrices(),
            totalQuantity: item.getTotalQuantity(),
            servingSize: item.getServingSize(),
        };

        let result = await collection.insertOne(document);
        await this.databaseClient.close();

        if (result.insertedId) {
            return true;
        } else {
            return false;
        }
    }

    async createPantryItem(pantryItem: PantryItem, account: Account) {
        await this.databaseClient.connect();
        const collection = this.databaseClient
            .db(this.databaseName)
            .collection(this.collectionName);

        let document = {
            _id: new ObjectId(),
            accountId: account.id,

            item: pantryItem.getBaseItem(),
            availableQuantity: pantryItem.getAvailableQuantity(),
            expirationDate: pantryItem.getExpirationDate(),
        };

        let result = await collection.insertOne(document);
        await this.databaseClient.close();

        if (result.insertedId) {
            return true;
        } else {
            return false;
        }
    }

    async deleteItem(item: Item, account: Account) {
        await this.databaseClient.connect();
        const collection = this.databaseClient
            .db(this.databaseName)
            .collection(this.collectionName);

        const queryFilter = {
            accountId: account.id,
            _id: new ObjectId(item.id),
        };

        let result = await collection.deleteOne(queryFilter);
        await this.databaseClient.close();

        if (result.deletedCount === 1) {
            return true;
        } else {
            return false;
        }
    }

    async deletePantryItem(item: PantryItem, account: Account) {
        await this.databaseClient.connect();
        const collection = this.databaseClient
            .db(this.databaseName)
            .collection(this.collectionName);

        const queryFilter = {
            accountId: account.id,
            _id: new ObjectId(item.id),
        };

        let result = await collection.deleteOne(queryFilter);
        await this.databaseClient.close();

        if (result.deletedCount === 1) {
            return true;
        } else {
            return false;
        }
    }

    //  Find all item in a user's account
    findAllItemsByAccount = async (account: Account) => {
        await this.databaseClient.connect();
        const collection = this.databaseClient
            .db(this.databaseName)
            .collection(this.collectionName);

        let queryFilter = { accountId: account.id };

        let docs = null;
        try {
            docs = await collection.find(queryFilter).toArray();
        } catch (error) {
            console.log(
                'Encounted an error on findAllItemsByAccount(): ',
                error
            );
        } finally {
            await this.databaseClient.close();
            return docs;
        }
    };

    async findItem(item: Item, itemId: string, account: Account) {
        await this.databaseClient.connect();
        const collection = this.databaseClient
            .db(this.databaseName)
            .collection(this.collectionName);

        let queryFilter = item.getSpecifiedProperties();
        queryFilter.accountId = account.id;
        queryFilter._id = new ObjectId(itemId);
        console.log(queryFilter);

        let docs;
        try {
            docs = await collection.findOne(queryFilter);
        } catch (err) {
            console.log(err);
        } finally {
            await this.databaseClient.close();
            return docs;
        }
    }

    async findItemsAtVendor(vendorName: string, account: Account) {
        await this.databaseClient.connect();
        const collection = this.databaseClient
            .db('pantry-db-dummy')
            .collection('user-items');

        let item = new Item();
        let queryFilter = item.getSpecifiedProperties();
        queryFilter.accountId = account.id;
        queryFilter.vendorPrices = { $elemMatch: { name: vendorName } };

        let docs;
        try {
            docs = await collection.find(queryFilter).toArray();
        } catch (err) {
            console.log(err);
        } finally {
            await this.databaseClient.close();
            return docs;
        }
    }

    async updateItem(item: Item, account: Account) {
        // Find current item
        // Make changes to item
    }
}
