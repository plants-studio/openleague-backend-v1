import { Router } from 'express';

import {
  create, join, list, remove, reply, waiting,
} from '../../../controllers/team';
import auth from '../../../middleware/auth';

const router = Router();

router.post('/', auth, create);
router.get('/', list);
router.put('/:id', auth, join);
router.delete('/:id', auth, remove);
router.put('/reply/:id', auth, reply);
router.get('/waiting/:id', auth, waiting);

export default router;
