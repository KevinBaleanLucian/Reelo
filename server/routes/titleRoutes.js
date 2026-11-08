import { Router } from "express";
import { popular, topRated,search,detail } from "../controllers/titleController.js";
import { validateRequest } from "../middleware/validate.js";
import { listSchemas, searchSchemas,detailSchemas } from "../validators/titleValidators.js";

const router=Router();

router.get('/search', validateRequest(searchSchemas),search);
router.get('/:type/popular',validateRequest(listSchemas),popular);
router.get('/:type/top-rated', validateRequest(listSchemas), topRated);
router.get('/:type/:id', validateRequest(detailSchemas), detail);

export default router;