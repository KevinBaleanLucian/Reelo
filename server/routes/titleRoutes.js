import { Router } from "express";
import { extras,popular, topRated,search,trending,discover,typeGenres,detail } from "../controllers/titleController.js";
import { validateRequest } from "../middleware/validate.js";
import { extrasSchemas,listSchemas, searchSchemas,trendingSchemas,discoverSchemas,typeSchemas,detailSchemas } from "../validators/titleValidators.js";

const router=Router();

router.get('/search', validateRequest(searchSchemas),search);
router.get('/trending',validateRequest(trendingSchemas),trending);
router.get('/:type/popular',validateRequest(listSchemas),popular);
router.get('/:type/top-rated', validateRequest(listSchemas), topRated);
router.get('/:type/discover', validateRequest(discoverSchemas), discover);
router.get('/:type/genres', validateRequest(typeSchemas), typeGenres);
router.get('/:type/:id/extras', validateRequest(extrasSchemas), extras);
router.get('/:type/:id', validateRequest(detailSchemas), detail);

export default router;