import express from 'express';
var app = express();

import cors from 'cors';
import { MongoClient } from 'mongodb';
import { Account } from './account';
import dotenv from 'dotenv';

import path from 'path';
import { AccountMapper } from './accountMapper';
import { ItemMapper } from './itemMapper';
import { Item } from './item';
import { ItemBuilder } from './itemBuilder';
const envPath = path.join(__dirname, '..', '/.env');
dotenv.config({ path: envPath });

const PORT = process.env.SERVER_PORT;
const DB_USER = process.env.DB_ADMIN_USER;
const DB_PASS = process.env.DB_ADMIN_PASS;
const DATABASE_URI =
    `mongodb+srv://${DB_USER}:${DB_PASS}` +
    `@cluster0.q4vjj.mongodb.net/pantry-db-dummy?retryWrites=true&w=majority`;

let databaseClient: any;
app.use(
    cors({
        origin: '*',
    })
);

export async function startServer(server: any) {
    server = await app.listen(PORT, () => {
        console.log('Now listening on port', PORT);
    });

    databaseClient = new MongoClient(DATABASE_URI);
    await databaseClient.connect();

    return server;
}

export async function stopServer(server: any) {
    await server.close();
    await databaseClient.close();
}

app.get('/get-test', async (req, res) => {
    res.send('Success!');
});

app.post('/create-account', async (req, res) => {
    console.log(`Attemping account creation using ${req.query.account}`);

    /*  req.query will be a JSON string, so it will need to be parsed
        and converted back into an Account object. */
    let data, object, newAccount;
    data = req.query.account;
    if (typeof data === 'string') {
        object = JSON.parse(data);
    } else {
        const error = new Error('Could not read data sent from client');
        throw error;
    }

    newAccount = new Account(
        object.emailAddress,
        object.firstName,
        object.lastName
    );
    let accountMapper = new AccountMapper();
    if (await accountMapper.findAccountByEmail(newAccount.emailAddress)) {
        console.log('Email already registered');
        res.send(false);
    } else {
        console.log('Creating account');
        if (await accountMapper.createAccount(newAccount)) {
            res.send(true);
        } else {
            res.send(false);
        }
    }
});

app.post('/delete-account', async (req, res) => {
    console.log(`Attemping account deletion using ${req.query.account}`);

    /*  req.query will be a JSON string, so it will need to be parsed
        and converted back into an Account object. */
    let data, object, account;
    data = req.query.account;
    if (typeof data === 'string') {
        object = JSON.parse(data);
    } else {
        const error = new Error('Could not read data sent from client');
        throw error;
    }

    account = new Account(
        object.emailAddress,
        object.firstName,
        object.lastName
    );
    let accountMapper = new AccountMapper();
    if (await accountMapper.findAccountByEmail(account.emailAddress)) {
        console.log('Deleting account');
        if (await accountMapper.deleteAccount(account)) {
            res.send(true);
        } else {
            res.send(false);
        }
    } else {
        console.log('Email not registered');
        res.send(false);
    }
});

app.get('/get-account', async (req, res) => {
    console.log(`Attemping account retrieval using ${req.query.emailAddress}`);

    /*  req.query will be a JSON string, so it will need to be parsed
    and converted back into an Account object. */
    let data, object, account;
    data = req.query.emailAddress;
    if (typeof data === 'string') {
        console.log('data = ', data);

        //object = JSON.parse(data);
    } else {
        const error = new Error('Could not read data sent from client');
        throw error;
    }

    let accountMapper = new AccountMapper();
    account = await accountMapper.findAccountByEmail(data);
    console.log('accountFound = ', account);

    res.send(account);
});

app.get('/get-items', async (req, res) => {
    console.log(`Attemping item retrieval using ${req.query.emailAddress}`);

    if (req.query.emailAddress === undefined) {
        return;
    }

    /*  req.query will be a JSON string, so it will need to be parsed
    and converted back into an Account object. */
    let data, object, account;
    data = req.query.emailAddress;
    if (typeof data === 'string') {
        console.log('data = ', data);

        //object = JSON.parse(data);
    } else {
        const error = new Error('Could not read data sent from client');
        throw error;
    }

    let accountMapper = new AccountMapper();
    if (typeof req.query.emailAddress === 'string') {
        account = await accountMapper.findAccountByEmail(
            req.query.emailAddress
        );
    }

    let itemMapper = new ItemMapper();
    let item = new Item();

    let itemsFound = 0;
    if (account !== undefined && account !== null) {
        itemsFound = await itemMapper.findItem(item, account);
    }

    console.log('itemsFound = ', itemsFound);
    res.send(itemsFound);
});

app.post('/add-item', async (req, res) => {
    console.log(`Attemping item addition using ${req.query.emailAddress}`);

    if (
        req.query.emailAddress === undefined ||
        req.query.itemObject === undefined
    ) {
        return;
    }

    let account;
    let accountMapper = new AccountMapper();
    if (typeof req.query.emailAddress === 'string') {
        account = await accountMapper.findAccountByEmail(
            req.query.emailAddress
        );
    }

    let item;
    let itemBuilder = new ItemBuilder();
    if (typeof req.query.itemObject === 'string') {
        item = itemBuilder.buildItem(req.query.itemObject);
    }

    let itemMapper = new ItemMapper();
    if (
        account !== undefined &&
        account !== null &&
        item !== undefined &&
        item !== null
    ) {
        await itemMapper.createItem(item, account);
    }

    res.send(true);
});

app.post('/delete-item', async (req, res) => {
    console.log(`Attemping item deletion using ${req.query.emailAddress}`);

    if (req.query.emailAddress === undefined) {
        return;
    }

    /*  req.query will be a JSON string, so it will need to be parsed
    and converted back into an Account object. */
    let account, itemName;
    itemName = req.query.itemName;

    let accountMapper = new AccountMapper();
    if (typeof req.query.emailAddress === 'string') {
        account = await accountMapper.findAccountByEmail(
            req.query.emailAddress
        );
    }

    let itemMapper = new ItemMapper();
    let item;
    let itemBuilder = new ItemBuilder();
    if (typeof req.query.itemObject === 'string') {
        item = itemBuilder.buildItem(req.query.itemObject);
    }

    console.log(item);

    let success;
    if (account !== undefined && account !== null && item !== undefined) {
        console.log('account id = ', account.id);
        account.id = account.id;
        success = await itemMapper.deleteItem(item, account);
    }
    console.log('Success = ', success);

    res.send(true);
});
