import {Router} from 'express';
import { list,mine,remove,save,unvoteHelpful,voteHelpful } from '../controllers/reviewController.js';
import { authOptional } from '../middleware/authOptional.js';
import { authRequired} from '../middleware/authRequired.js';
import {validate,validateRequest} from '../middleware/validate.js';
import { listReviewSchemas,reviewBodySchema,reviewIdSchemas,titleReviewParams } from '../validators/reviewValidators.js';

function noStore(req,res,next){
    res.set('Cache-Control','private, no-store');
    next();
}

export const titleReviewRouter=Router({mergeParams: true});

titleReviewRouter.use(noStore);
titleReviewRouter.get('/', authOptional, validateRequest(listReviewSchemas), list);
titleReviewRouter.get('/mine', authRequired, validateRequest(titleReviewParams), mine);
titleReviewRouter.put('/mine', authRequired, validateRequest(titleReviewParams), validate(reviewBodySchema), save);
titleReviewRouter.delete('/mine', authRequired, validateRequest(titleReviewParams), remove);

export const reviewRouter = Router();

reviewRouter.use(noStore);
reviewRouter.put('/:reviewId/helpful', authRequired, validateRequest(reviewIdSchemas), voteHelpful);
reviewRouter.delete('/:reviewId/helpful', authRequired, validateRequest(reviewIdSchemas), unvoteHelpful);