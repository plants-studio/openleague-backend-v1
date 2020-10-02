import { Router } from 'express';

import auth from './auth';
import league from './league';

const router = Router();

router.use('/auth', auth);
router.use('/league', league);

export default router;
