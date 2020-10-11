import { Router } from 'express';

import revoke from './revoke';
import signin from './signin';
import signup from './signup';
import token from './token';

const router = Router();

router.use('/revoke', revoke);
router.use('/signin', signin);
router.use('/signup', signup);
router.use('/token', token);

export default router;
