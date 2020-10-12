import { Router } from 'express';

import auth from './auth';
import friend from './friend';
import league from './league';
import post from './post';
import team from './team';

const router = Router();

router.use('/auth', auth);
router.use('/friend', friend);
router.use('/league', league);
router.use('/post', post);
router.use('/team', team);

export default router;
