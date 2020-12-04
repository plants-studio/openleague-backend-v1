import { Router } from 'express';

import {
  discord, edit, getData, refresh, revoke, signin, signup,
} from '../../../controllers/auth';

const router = Router();

router.put('/', edit);
router.get('/:id', getData);
router.post('/discord', discord);
router.post('/refresh', refresh);
router.post('/revoke', revoke);
router.post('/signin', signin);
router.post('/signup', signup);

export default router;
