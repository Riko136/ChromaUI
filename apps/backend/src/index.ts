import express from 'express';
import cors from 'cors';
import connectRouter from './routes/connect.js';
import collectionsRouter from './routes/collections.js';
import itemsRouter from './routes/items.js';
import queryRouter from './routes/query.js';
import { isConnected } from './chroma.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/connect', connectRouter);

app.use('/api/collections', (_req, res, next) => {
  if (!isConnected()) {
    res.status(401).json({ error: 'ChromaDB not responding' });
    return;
  }
  next();
});

app.use('/api/collections', collectionsRouter);
app.use('/api/collections', itemsRouter);
app.use('/api/collections', queryRouter);

if(process.env.NODE_ENV === 'production'){
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');

  app.use(express.static(frontendDist));
  app.use((_req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
} else {
  app.use((_req, res) => res.status(404).send('Not serving frontend in dev mode'));
}


app.listen(3000, () => console.log('Backend running on :3000'));