import { Router } from 'express';
import { getClient } from '../chroma.js';

const router = Router();

router.get('/:name/items', async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? '50');
  const offset = parseInt((req.query.offset as string) ?? '0');
  const collection = await getClient().getCollection({ name: req.params.name });
  const result = await collection.get({
    limit,
    offset,
    include: ['documents', 'metadatas', 'embeddings'],
  });
  res.json(result);
});

router.post('/:name/items', async (req, res) => {
  const { ids, documents, metadatas, embeddings } = req.body;
  const collection = await getClient().getCollection({ name: req.params.name });
  await collection.add({ ids, documents, metadatas, embeddings });
  res.status(201).json({ added: ids.length });
});

router.patch('/:name/items/:id', async (req, res) => {
  const { document, metadata } = req.body;
  const collection = await getClient().getCollection({ name: req.params.name });
  await collection.update({
    ids: [req.params.id],
    ...(document !== undefined && { documents: [document] }),
    ...(metadata !== undefined && { metadatas: [metadata] }),
  });
  res.json({ updated: req.params.id });
});

router.delete('/:name/items/:id', async (req, res) => {
  const collection = await getClient().getCollection({ name: req.params.name });
  await collection.delete({ ids: [req.params.id] });
  res.status(204).send();
});

export default router;