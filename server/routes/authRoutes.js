import {Router} from 'express';
import { register,login,getMe } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { registerSchema,loginSchema } from '../validators/authValidators.js';
import { authRequired } from '../middleware/authRequired.js';
const router=Router();

router.post('/register',validate(registerSchema),register);
router.post('/login',validate(loginSchema),login);
router.get('/me',authRequired,getMe);

export default router;