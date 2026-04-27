import { CloudClient, ChromaClient } from 'chromadb';
import dotenv from 'dotenv';

export type ConnectParams = {
  url: string;
  tenant: string;
  database: string;
};


let client: ChromaClient | null = null;

export function connectToCloud(): void {
    dotenv.config()
    client = new CloudClient();
}

export function connect(params: ConnectParams): void {
    client = new ChromaClient({
        path: params.url,
        tenant: params.tenant,
        database: params.database
    });
}


export function isConnected(): boolean {
    try {
        getClient().heartbeat();
        return true;
    } catch {
        return false;
    }
}

export function getClient(): ChromaClient {
  if (!client) throw new Error('No client found');
  return client;
}