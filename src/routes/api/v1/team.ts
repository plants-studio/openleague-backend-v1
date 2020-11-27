import { Router } from 'express';

import {
  join, list, remove, reply, waiting,
} from '../../../controllers/team';
import auth from '../../../middleware/auth';

const router = Router();

router.put('/:id', auth, join);
router.get('/', list);
router.delete('/:id', auth, remove);
router.put('/reply/:id', auth, reply);
router.get('/waiting/:id', auth, waiting);

export default router;
