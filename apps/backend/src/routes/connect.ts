import { Router } from 'express';
import { connect, getClient, isConnected } from '../chroma.js';

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

  connect({ url, tenant, database });


});



export default router;
