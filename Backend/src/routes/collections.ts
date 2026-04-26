import { Router } from 'express';
import { getClient } from '../chroma.js';

const router = Router();

router.get('/', async (_req, res) => {
  const collections = await getClient().listCollections();
  res.json(collections);
});

router.post('/', async (req, res) => {
  const { name, metadata } = req.body;
  const collection = await getClient().createCollection({ name, metadata });
  res.status(201).json({ name: collection.name, metadata: collection.metadata });
});

router.delete('/:name', async (req, res) => {
  await getClient().deleteCollection({ name: req.params.name });
  res.status(204).send();
});

export default router;