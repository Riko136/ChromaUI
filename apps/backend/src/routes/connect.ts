import { Router } from 'express';
import { connect, connectToCloud, getClient, isConnected } from '../chroma.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ connected: isConnected() });
});

router.post('/', async (req, res) => {
  const { url, tenant, database } = req.body;

  if (!url || !tenant || !database) {
    res.status(400).json({ error: 'all fields are required' });
    return;
  }

  try{
    connect({ url, tenant, database });
  }catch{
    res.status(401).json({ error: 'failed to connect to ChromaDB server' });
  }


});

router.post('/cloud', async (req, res) => {
  try{
    connectToCloud(); 
  } catch{
    res.status(401).json({ error: 'failed to connect to ChromaDB Cloud' });
  }
});



export default router;
