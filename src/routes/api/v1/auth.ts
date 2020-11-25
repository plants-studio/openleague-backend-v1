import { Router } from 'express';

import discord from '../../../controllers/auth/discord';
import revoke from '../../../controllers/auth/revoke';
import signin from '../../../controllers/auth/signin';
import signup from '../../../controllers/auth/signup';
import token from '../../../controllers/auth/token';

const router = Router();

router.post('/discord', discord);
router.post('/revoke', revoke);
router.post('/signin', signin);
router.post('/signup', signup);
router.post('/token', token);

export default router;
