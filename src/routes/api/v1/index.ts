import { Router } from 'express';

import auth from './auth';
import league from './league';
import post from './post';
import team from './team';
import user from './user';

const router = Router();

router.use('/auth', auth);
router.use('/league', league);
router.use('/post', post);
router.use('/team', team);
router.use('/user', user);

export default router;
