import { Router } from 'express';
import { getClient } from '../chroma.js';

const router = Router();

router.get('/', async (_req, res) => {
  const collections = await getClient().listCollections();
  res.json(
    collections.map((c) => ({
      id: c.id,
      name: c.name,
      metadata: c.metadata,
    })),
  );
});

router.post('/', async (req, res) => {
  try{
    const { name, metadata } = req.body;
    const collection = await getClient().createCollection({ name, metadata });
    res.status(201).json({ name: collection.name, metadata: collection.metadata });
  } catch(error: any){
    res.status(500).json({error: error.message})
  }

});

router.patch('/:name', async (req, res) => {
  try {
    const { name: newName, metadata } = req.body;
    const collection = await getClient().getCollection({ name: req.params.name });
    await collection.modify({
      ...(newName !== undefined && { name: newName }),
      ...(metadata !== undefined && { metadata }),
    });
    res.json({
      id: collection.id,
      name: collection.name,
      metadata: collection.metadata,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:name', async (req, res) => {
  await getClient().deleteCollection({ name: req.params.name });
  res.status(204).send();
});

export default router;