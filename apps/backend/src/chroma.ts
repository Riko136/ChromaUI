import { CloudClient, ChromaClient } from 'chromadb';
import dotenv from 'dotenv';

export type ConnectParams = {
  url: string;
  tenant: string;
  database: string;
};

export type CloudParams = {
    apikey: string;
    tenant: string;
    database: string;
}


let client: ChromaClient | null = null;

export function connectToCloud(params: CloudParams): void {
    client = new CloudClient({
        apiKey: params.apikey,
        tenant: params.tenant,
        database: params.database
    });
}

export function connect(params: ConnectParams): void {
    const parsed = new URL(params.url);
    const ssl = parsed.protocol === 'https:';
    client = new ChromaClient({
        ssl,
        host: parsed.hostname,
        port: parsed.port ? Number(parsed.port) : (ssl ? 443 : 80),
        tenant: params.tenant,
        database: params.database,
    });
}


export function isConnected(): boolean {
    try{
        getClient().heartbeat();
        return true;
    }catch{
        return false;
    }
    
}

export function getClient(): ChromaClient {
  if (!client) throw new Error('No client found');
  return client;
}