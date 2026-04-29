import { Router } from 'express';
import { connect, connectToCloud, getClient } from '../chroma.js';

const router = Router();

// router.get('/', (_req, res) => {
//   res.json({ connected: isConnected() });
// });

router.post('/', async (req, res) => {
  const { url, tenant, database } = req.body;

  try{
    connect({ url, tenant, database });
    await getClient().listCollections();
    res.sendStatus(200)
  }catch{
    res.status(401).json({ error: 'failed to connect to ChromaDB instance' });
  }


});

router.post('/cloud', async (req, res) => {
  const { apikey, tenant, database } = req.body;

  try{
    connectToCloud({apikey, tenant, database});
    await getClient().listCollections();
    res.sendStatus(200);
  } catch{
    res.status(401).json({ error: 'failed to connect to ChromaDB Cloud' });
  }
});



export default router;
