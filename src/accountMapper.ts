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

export class AccountMapper {
    databaseClient: MongoClient;
    databaseName: string;
    collectionName: string;

    constructor(databaseName: string, collectionName: string) {
        this.databaseClient = new MongoClient(DATABASE_URI);
        this.databaseName = databaseName;
        this.collectionName = collectionName;
    }

    async createAccount(account: Account) {
        if (await this.findAccountByEmail(account.emailAddress)) {
            return false;
        } else {
            await this.databaseClient.connect();
            const collection = this.databaseClient
                .db('pantry-db-dummy')
                .collection('accounts');

            const document = {
                _id: new ObjectId(),
                emailAddress: account.emailAddress,
                firstName: account.firstName,
                lastName: account.lastName,
                dateCreated: new Date(),
            };

            await collection.insertOne(document);
            this.databaseClient.close();

            return true;
        }
    }

    async deleteAccount(account: Account) {
        if (await this.findAccountByEmail(account.emailAddress)) {
            await this.databaseClient.connect();
            const collection = this.databaseClient
                .db('pantry-db-dummy')
                .collection('accounts');
            const queryFilter = { emailAddress: account.emailAddress };

            await collection.deleteOne(queryFilter);
            await this.databaseClient.close();
            return true;
        } else {
            return false;
        }
    }

    toAccount(data: any) {
        let account = new Account();

        account.id = data._id;
        account.emailAddress = data.emailAddress;
        account.firstName = data.firstName;
        account.lastName = data.lastName;
        account.dateCreated = data.dateCreated;

        return account;
    }

    toDatabase(account: Account) {}

    // TODO: Consider renaming to 'getAccountByEmail' and return the account
    findAccountByEmail = async (emailAddress: string) => {
        await this.databaseClient.connect();

        console.log(
            'Searching for existing account with email address:',
            emailAddress
        );
        let account: Account | null = null;

        try {
            const collection = this.databaseClient
                .db(this.databaseName)
                .collection(this.collectionName);
            const queryFilter = { emailAddress: emailAddress };
            const data = await collection.findOne(queryFilter);

            if (data === null) {
                console.log('Email address was not found');
            } else {
                console.log('Email address successfully found');
                account = this.toAccount(data);
            }
        } catch (error) {
            console.log('Encounted an error on findAccountByEmail(): ', error);
        } finally {
            await this.databaseClient.close();
            return account;
        }
    };
}
