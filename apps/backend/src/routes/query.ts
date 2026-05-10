import { Router } from 'express';
import { getClient } from '../chroma.js';

const router = Router();

router.post('/:name/text', async (req, res) => {
  try{
  const { text, where, ids } = req.body;
  const collection = await getClient().getCollection({ name: req.params.name });
  const results = await collection.get({
    whereDocument: { $contains: text },
    ...(where !== null && { where }), 
    ...(ids !== null && { ids }),
    // include: ['documents', 'metadatas'],
  });
  res.json(results.rows());
  }catch(e:any){
    res.status(500).json({error: e.message})
  }
});

router.post('/:name/semantic', async (req, res) => {
  try{
    const { where, queryText, ids,  } = req.body;
    const collection = await getClient().getCollection({ name: req.params.name });
    const results = await collection.query({
      queryTexts: [queryText],
      ...(where !== null && { where }),
      ids,
      nResults: 100,
      include: ['documents', 'metadatas', 'embeddings', 'distances'],
    });
    res.json(results.rows()[0]);
  }catch(e:any){
    res.status(500).json({error: e.message})
  }


});

router.post('/:name/regex', async (req, res) => {
  try{
    const { where, ids, regex } = req.body;
    const collection = await getClient().getCollection({ name: req.params.name });
    const results = await collection.get({
      ...(where !== null && { where }),
      ids,
      whereDocument: {"$regex": regex},
      // include: ['documents', 'metadatas', 'embeddings'],
    });
    res.json(results.rows());
  }catch(e:any){
    res.status(500).json({error: e.message})
  }

});

export default router;