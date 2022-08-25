import { startServer } from './server';

async function allowConnections() {
    let s;
    s = await startServer(s);
}

allowConnections();
console.log('Allowing connections...');
