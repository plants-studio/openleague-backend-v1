import { Router } from 'express';

import revoke from '../../../controllers/auth/revoke';
import signin from '../../../controllers/auth/signin';
import signup from '../../../controllers/auth/signup';
import token from '../../../controllers/auth/token';

const router = Router();

router.post('/revoke', revoke);
router.post('/signin', signin);
router.post('/signup', signup);
router.post('/token', token);

export default router;
