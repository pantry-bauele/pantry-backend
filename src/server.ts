import express from 'express';
import { Request, Response, NextFunction } from 'express';
var app = express();

import cors from 'cors';
import { MongoClient } from 'mongodb';
import { Account } from './account';

import dotenv from 'dotenv';

import path from 'path';
import { AccountMapper } from './accountMapper';
import { ItemMapper } from './itemMapper';
import { Item } from '../pantry-shared/src/item';
import { ItemBuilder } from '../pantry-shared/src/itemBuilder';
import { PantryItemBuilder } from '../pantry-shared/src/pantryItemBuilder';
import { PantryItem } from '../pantry-shared/src/pantryItem';
import { ParsedQs } from 'qs';

const envPath = path.join(__dirname, '..', '../.env');
dotenv.config({ path: envPath });

const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
let keyPath = path.join(
    __dirname,
    '..',
    '../../../../etc/letsencrypt/live/bauele.com/privkey.pem'
);
let certPath = path.join(
    __dirname,
    '..',
    '../../../../etc/letsencrypt/live/bauele.com/fullchain.pem'
);

let options: null | { key: string; cert: string } = null;
try {
    options = {
        key: fs.readFileSync(keyPath, 'utf8'),
        cert: fs.readFileSync(certPath, 'utf8'),
    };
} catch (error) {
    console.log('Error accessing SSL: ', error);
}

import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp({
    credential: applicationDefault(),
});

const PORT = process.env.SERVER_PORT;
const DB_USER = process.env.DB_ADMIN_USER;
const DB_PASS = process.env.DB_ADMIN_PASS;
const DATABASE_NAME = process.env.DB_NAME;
const DATABASE_URI =
    `mongodb+srv://${DB_USER}:${DB_PASS}` +
    `@cluster0.q4vjj.mongodb.net/pantry-db-dummy?retryWrites=true&w=majority`;

if (!DATABASE_NAME) {
    console.log('Error reading database name. Terminating...');
    process.exit(1);
}

let databaseClient: MongoClient;

app.use(
    cors({
        origin: '*',
    })
);

export const startServer = async (server: any) => {
    if (options !== null) {
        server = https.createServer(options, app).listen(PORT, function () {
            console.log('HTTPS express server listening on port ' + PORT);
        });
    } else {
        server = http.createServer(app).listen(PORT, function () {
            console.log('HTTP express server listening on port ' + PORT);
        });
    }

    databaseClient = new MongoClient(DATABASE_URI);
    await databaseClient.connect();

    return server;
};

export async function stopServer(server: any) {
    await server.close();
    await databaseClient.close();
}

const authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log('\nAttempting to authenticate user with request: ');
    logRequestParameters(req.query);

    if (
        !req.query.credentials ||
        typeof req.query.credentials !== 'string' ||
        !req.query.emailAddress ||
        typeof req.query.emailAddress !== 'string'
    ) {
        console.log('Request to server sent invalid parameters.');
        res.status(400).send(
            'Request did not include authentication credentials.'
        );
        return;
    }

    let credentials;
    try {
        credentials = JSON.parse(req.query.credentials);
    } catch (error: any) {
        console.log(
            'Error converting credentials to JSON object: ',
            error.message
        );
        res.status(500).send(
            'Server encountered an error attempting to read authentication credentials.'
        );
        return;
    }

    let idToken = credentials._tokenResponse.idToken;
    if (!idToken) {
        console.log('ID Token not available. Terminating...');
        res.status(400).send(
            'Request did not include authentication credentials token.'
        );
        return;
    }

    let credentialsEmailAddress = credentials.user.email;
    if (!credentialsEmailAddress) {
        console.log('Credentials email address not available. Terminating...');
        res.status(400).send(
            'Request did not include authentication credentials email address.'
        );
        return;
    }

    let requestEmailAddress = req.query.emailAddress;
    let decodedToken = await getAuth().verifyIdToken(idToken);
    if (!decodedToken || requestEmailAddress !== credentialsEmailAddress) {
        console.log(
            'Credentials email address did not match request email address. Terminating...'
        );
        res.status(403).send(
            'You do not have permission to access this resource.'
        );
        return;
    }

    next();
};

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
    let accountMapper = new AccountMapper('pantry-db-dummy', 'accounts');
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
    let accountMapper = new AccountMapper('pantry-db-dummy', 'accounts');
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

    let accountMapper = new AccountMapper('pantry-db-dummy', 'accounts');
    account = await accountMapper.findAccountByEmail(data);
    if (account) {
        console.log('accountFound = ', account);
        res.status(200).send(account);
    } else {
        res.status(404).send('Could not find account');
    }
});

app.get('/get-all-pantry-items', async (req, res) => {
    console.log(`\nAttemping to get all pantry items with request: `);
    logRequestParameters(req.query);

    if (!req.query.emailAddress || typeof req.query.emailAddress !== 'string') {
        res.status(400).send('Request to server sent invalid parameters.');
        return;
    }

    if (!DATABASE_NAME) {
        res.status(500).send('Fatal server error');
        return;
    }

    let account = await findAccountByEmail(
        DATABASE_NAME,
        req.query.emailAddress
    );
    if (!account) {
        res.status(400).send('Account does not exist.');
        return;
    }

    let results = await findAllItemsByAccount(
        DATABASE_NAME,
        'user-pantry',
        account
    );
    if (results) {
        console.log(`${results.length} items were found`);
    }

    res.status(200).send(results);
});

// req.query should be { emailAddress: 'email@domain.com' }
app.get('/get-all-items', authenticateUser, async (req, res) => {
    console.log(`\nAttemping to get all items with request: `);
    logRequestParameters(req.query);

    if (!req.query.emailAddress || typeof req.query.emailAddress !== 'string') {
        res.status(400).send('Request to server sent invalid parameters.');
        return;
    }

    if (!DATABASE_NAME) {
        res.status(500).send('Fatal server error');
        return;
    }

    let account = await findAccountByEmail(
        DATABASE_NAME,
        req.query.emailAddress
    );
    if (!account) {
        res.status(400).send('Account does not exist.');
        return;
    }

    let results = await findAllItemsByAccount(
        DATABASE_NAME,
        'user-items',
        account
    );
    if (results) {
        console.log(`${results.length} items were found`);
    }

    res.status(200).send(results);
});

app.get('/get-item', async (req, res) => {
    console.log(`\nAttemping to get one item with request: `);
    logRequestParameters(req.query);

    if (
        !req.query.emailAddress ||
        typeof req.query.emailAddress !== 'string' ||
        !req.query.itemId ||
        typeof req.query.itemId !== 'string'
    ) {
        res.status(400).send('Request to server sent invalid parameters.');
        return;
    }

    if (!DATABASE_NAME) {
        res.status(500).send('Fatal server error');
        return;
    }

    let account = await findAccountByEmail(
        DATABASE_NAME,
        req.query.emailAddress
    );
    if (!account) {
        res.status(400).send('Account does not exist.');
        return;
    }

    let itemMapper = new ItemMapper(DATABASE_NAME, 'user-items');
    let item = new Item();

    let results;
    try {
        results = await itemMapper.findItem(item, req.query.itemId, account);
    } catch (error: any) {
        console.log('Error during /get-item: ', error.message);
        res.status(500).send('Fatal server database error');
        return;
    }

    if (results) {
        console.log('Item was found');
    }

    res.status(200).send(results);
});

app.post('/create-item', async (req, res) => {
    console.log(`\nAttemping to create an item with request: `);
    logRequestParameters(req.query);

    if (
        !req.query.emailAddress ||
        typeof req.query.emailAddress !== 'string' ||
        !req.query.itemObject ||
        typeof req.query.itemObject !== 'string'
    ) {
        res.status(400).send('Request to server sent invalid parameters.');
        return;
    }

    if (!DATABASE_NAME) {
        res.status(500).send('Fatal server error');
        return;
    }

    let account = await findAccountByEmail(
        DATABASE_NAME,
        req.query.emailAddress
    );
    if (!account) {
        res.status(400).send('Account does not exist.');
        return;
    }

    let itemBuilder = new ItemBuilder();
    let item = itemBuilder.buildItem(req.query.itemObject);
    let itemMapper = new ItemMapper(DATABASE_NAME, 'user-items');

    let success = await itemMapper.createItem(item, account);
    if (success) {
        console.log('Item created successfully');
        res.status(200).send(true);
    } else {
        console.log('Error creating item');
        res.status(500).send('Fatal server database error');
    }
});

app.post('/create-pantry-item', async (req, res) => {
    console.log(`\nAttemping to create an item with request: `);
    logRequestParameters(req.query);

    if (
        !req.query.emailAddress ||
        typeof req.query.emailAddress !== 'string' ||
        !req.query.itemObject ||
        typeof req.query.itemObject !== 'string'
    ) {
        res.status(400).send('Request to server sent invalid parameters.');
        return;
    }

    if (!DATABASE_NAME) {
        res.status(500).send('Fatal server error');
        return;
    }

    let account = await findAccountByEmail(
        DATABASE_NAME,
        req.query.emailAddress
    );
    if (!account) {
        res.status(400).send('Account does not exist.');
        return;
    }

    let pantryItemBuilder = new PantryItemBuilder();
    let pantryItem = pantryItemBuilder.buildItem(req.query.itemObject);
    let itemMapper = new ItemMapper(DATABASE_NAME, 'user-pantry');

    let success = await itemMapper.createPantryItem(pantryItem, account);
    if (success) {
        console.log('Item created successfully');
        res.status(200).send(true);
    } else {
        console.log('Error creating item');
        res.status(500).send('Fatal server database error');
    }
});

app.post('/edit-item', async (req, res) => {
    console.log(`\nAttemping to edit an item with request: `);
    logRequestParameters(req.query);

    if (
        !req.query.emailAddress ||
        typeof req.query.emailAddress !== 'string' ||
        !req.query.itemObject ||
        typeof req.query.itemObject !== 'string'
    ) {
        res.status(400).send('Request to server sent invalid parameters.');
        return;
    }

    if (!DATABASE_NAME) {
        res.status(500).send('Fatal server error');
        return;
    }

    let account = await findAccountByEmail(
        DATABASE_NAME,
        req.query.emailAddress
    );
    if (!account) {
        res.status(400).send('Account does not exist.');
        return;
    }

    let itemBuilder = new ItemBuilder();
    let item = itemBuilder.buildItem(req.query.itemObject);
    let itemMapper = new ItemMapper(DATABASE_NAME, 'user-items');

    let deleted = await itemMapper.deleteItem(item, account);
    let created;
    if (deleted) {
        created = itemMapper.createItem(item, account);
    }

    if (created) {
        console.log('Item edited successfully');
        res.status(200).send(true);
    } else if (deleted && !created) {
        console.log('Error recreating item after deletion during editing');
        res.status(500).send('Fatal server database error');
    } else if (!deleted) {
        console.log('Error deleting item during editing');
        res.status(500).send('Fatal server database error');
    }
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

    let accountMapper = new AccountMapper('pantry-db-dummy', 'accounts');
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

app.post('/edit-pantry-item', async (req, res) => {
    console.log(`Attemping item edit using ${req.query.emailAddress}`);

    if (
        req.query.emailAddress === undefined ||
        req.query.itemObject === undefined
    ) {
        return;
    }

    let account;
    let accountMapper = new AccountMapper('pantry-db-dummy', 'accounts');
    if (typeof req.query.emailAddress === 'string') {
        account = await accountMapper.findAccountByEmail(
            req.query.emailAddress
        );
    }

    let pantryItem;
    let pantryItemBuilder = new PantryItemBuilder();
    if (typeof req.query.itemObject === 'string') {
        pantryItem = pantryItemBuilder.buildItem(req.query.itemObject);
    }

    let itemMapper = new ItemMapper();
    if (
        account !== undefined &&
        account !== null &&
        pantryItem !== undefined &&
        pantryItem !== null
    ) {
        await itemMapper.deletePantryItem(pantryItem, account);
        await itemMapper.createPantryItem(pantryItem, account);
    }

    res.send(true);
});

app.post('/delete-pantry-item', async (req, res) => {
    console.log(`Attemping item deletion using ${req.query.emailAddress}`);

    if (req.query.emailAddress === undefined) {
        return;
    }

    /*  req.query will be a JSON string, so it will need to be parsed
    and converted back into an Account object. */
    let account, itemName;
    itemName = req.query.itemName;

    let accountMapper = new AccountMapper('pantry-db-dummy', 'accounts');
    if (typeof req.query.emailAddress === 'string') {
        account = await accountMapper.findAccountByEmail(
            req.query.emailAddress
        );
    }

    let itemMapper = new ItemMapper();
    let pantryItemBuilder = new PantryItemBuilder();
    let pantryItem = pantryItemBuilder.buildItem(req.query.itemObject);

    if (typeof req.query.itemObject === 'string') {
        //item = itemBuilder.buildItem(req.query.itemObject);
    }

    console.log(pantryItem);

    let success;
    if (account !== undefined && account !== null && pantryItem !== undefined) {
        console.log('account id = ', account.id);
        account.id = account.id;
        success = await itemMapper.deletePantryItem(pantryItem, account);
    }
    console.log('Success = ', success);

    res.send(true);
});

async function findAllItemsByAccount(
    databaseName: string,
    collectionName: string,
    account: Account
) {
    let itemMapper = new ItemMapper(databaseName, collectionName);
    let results;
    results = await itemMapper.findAllItemsByAccount(account);
    return results;
}

async function findAccountByEmail(databaseName: string, emailAddress: string) {
    let accountMapper = new AccountMapper(databaseName, 'accounts');
    let account = await accountMapper.findAccountByEmail(emailAddress);
    return account;
}

function logRequestParameters(query: ParsedQs) {
    for (const parameter in query) {
        console.log(`${parameter}: ${query[parameter]}`);
    }
}
