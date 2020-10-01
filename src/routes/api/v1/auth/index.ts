import { Router } from 'express';

import signin from './signin';
import signup from './signup';

const router = Router();

router.use('/signin', signin);
router.use('/signup', signup);

export default router;
