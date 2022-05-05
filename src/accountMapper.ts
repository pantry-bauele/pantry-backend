import { Account } from './account';
import { MongoClient, ObjectId } from 'mongodb';

// Required to pull data from the .env file
import dotenv from 'dotenv';
import path from 'path';
const envPath = path.join(__dirname, '..', '/.env');
dotenv.config({ path: envPath });

const DB_USER = process.env.DB_ADMIN_USER;
const DB_PASS = process.env.DB_ADMIN_PASS;
const DATABASE_URI =
    `mongodb+srv://${DB_USER}:${DB_PASS}` +
    `@cluster0.q4vjj.mongodb.net/pantry-db-dummy?retryWrites=true&w=majority`;

let databaseClient: any;

export class AccountMapper {
    constructor() {
        databaseClient = new MongoClient(DATABASE_URI);
    }

    async createAccount(account: Account) {
        if (await this.findAccountByEmail(account.emailAddress)) {
            return false;
        } else {
            await databaseClient.connect();
            const collection = databaseClient
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
            databaseClient.close();

            return true;
        }
    }

    async deleteAccount(account: Account) {
        if (await this.findAccountByEmail(account.emailAddress)) {
            await databaseClient.connect();
            const collection = databaseClient
                .db('pantry-db-dummy')
                .collection('accounts');
            const queryFilter = { emailAddress: account.emailAddress };

            await collection.deleteOne(queryFilter);
            await databaseClient.close();
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
    async findAccountByEmail(emailAddress: string) {
        await databaseClient.connect();

        console.log('Checking for existing email', emailAddress);
        let account;

        try {
            const collection = databaseClient
                .db('pantry-db-dummy')
                .collection('accounts');
            const queryFilter = { emailAddress: emailAddress };
            const data = await collection.findOne(queryFilter);

            if (data === null) {
                console.log('Email not found');

                return null;
            } else {
                console.log('Email already registered');
                account = this.toAccount(data);
                console.log(account);
            }
        } catch (error) {
            console.log('Encounted an error on searchEmail()');
            console.log(error);
        } finally {
            await databaseClient.close();
            return account;
        }
    }
}
