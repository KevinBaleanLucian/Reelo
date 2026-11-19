import { Router } from 'express';
import { list, lookup, remove, summary, upsert } from '../controllers/watchlistController.js';
import { authRequired } from '../middleware/authRequired.js';
import { validate, validateRequest } from '../middleware/validate.js';
import {entrySchemas,listSchemas,lookupSchemas,upsertBodySchema,} from '../validators/watchlistValidators.js';

const router = Router();

router.use(authRequired);

router.use((req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
});

router.get('/', validateRequest(listSchemas), list);
router.get('/summary', summary);
router.get('/lookup', validateRequest(lookupSchemas), lookup);
router.put('/:type/:tmdbId', validateRequest(entrySchemas), validate(upsertBodySchema), upsert);
router.delete('/:type/:tmdbId', validateRequest(entrySchemas), remove);

export default router;