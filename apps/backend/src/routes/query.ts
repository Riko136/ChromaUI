import { Router } from 'express';
import { getClient } from '../chroma.js';

const router = Router();

router.post('/:name/query', async (req, res) => {
  const { queryText, nResults = 10, where } = req.body;
  const collection = await getClient().getCollection({ name: req.params.name });
  const results = await collection.query({
    queryTexts: [queryText],
    nResults,
    ...(where !== undefined && { where }),
    include: ['documents', 'metadatas', 'embeddings', 'distances'],
  });
  res.json(results);
});

router.post('/:name/where', async (req, res) => {
  const { where, limit = 50, offset = 0 } = req.body;
  const collection = await getClient().getCollection({ name: req.params.name });
  const results = await collection.get({
    where,
    limit,
    offset,
    include: ['documents', 'metadatas', 'embeddings'],
  });
  res.json(results);
});

export default router;