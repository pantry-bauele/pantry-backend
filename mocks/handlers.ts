import dotenv from 'dotenv';
import path from 'path';
const envPath = path.join(__dirname, '..', '/.env');
dotenv.config({ path: envPath });
const ADDRESS = process.env.SERVER_ADDRESS;
const PORT = process.env.SERVER_PORT;
const SERVER_URL = `http://${ADDRESS}:${PORT}`;

import { rest } from 'msw';

export const handlers = [
    rest.post(`${SERVER_URL}/create-account`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ message: 'account created!' }));
    }),
];
