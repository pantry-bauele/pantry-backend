import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

import { startServer, stopServer } from '../src/server';
import { Account } from '../src/account';

const envPath = path.join(__dirname, '..', '/.env');
dotenv.config({ path: envPath });
const ADDRESS = process.env.SERVER_ADDRESS;
const PORT = process.env.SERVER_PORT;
const SERVER_URL = `http://${ADDRESS}:${PORT}`;

test('Successful account creation with new email address', async () => {
    let s;
    s = await startServer(s);

    let newAccount = new Account('new_user@domain.com', 'New', 'User');

    let response = await axios({
        method: 'post',
        url: `${SERVER_URL}/create-account`,
        params: {
            account: newAccount,
        },
    });

    await stopServer(s);
    expect(response.data).toBe(true);
});

test('Failed account creation due to existing email address', async () => {
    let s;
    s = await startServer(s);
    console.log('server = ', SERVER_URL);

    /*  Once this account is created the first time, it will forever exist until
        it is deleted. Therefore this test will only ever fail. */
    let newAccount = new Account('new_user@domain.com', 'New', 'User');

    let response = await axios({
        method: 'post',
        url: `${SERVER_URL}/create-account`,
        params: {
            account: newAccount,
        },
    });

    await stopServer(s);
    expect(response.data).toBe(false);
});

test('Failed account deletion with a non-existent email address', async () => {
    let s;
    s = await startServer(s);

    let account = new Account('fake_user@domain.com');

    let response = await axios({
        method: 'post',
        url: `${SERVER_URL}/delete-account`,
        params: {
            account: account,
        },
    });

    await stopServer(s);
    expect(response.data).toBe(false);
});

test('Successful account deletion with an existing email address', async () => {
    let s;
    s = await startServer(s);

    let account = new Account('new_user@domain.com');

    let response = await axios({
        method: 'post',
        url: `${SERVER_URL}/delete-account`,
        params: {
            account: account,
        },
    });

    await stopServer(s);
    expect(response.data).toBe(true);
});
