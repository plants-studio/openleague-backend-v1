import { Router } from 'express';

import {
  data, discord, edit, refresh, revoke, signin, signup,
} from '../../../controllers/auth';

const router = Router();

router.put('/', edit);
router.get('/:id', data);
router.post('/discord', discord);
router.post('/refresh', refresh);
router.post('/revoke', revoke);
router.post('/signin', signin);
router.post('/signup', signup);

export default router;
