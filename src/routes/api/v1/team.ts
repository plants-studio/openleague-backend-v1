import { Router } from 'express';

import {
  accept, create, join, list, remove, waiting,
} from '../../../controllers/team';
import auth from '../../../middleware/auth';

const router = Router();

router.put('/accept/:id', auth, accept);
router.post('/', create);
router.put('/:id', auth, join);
router.get('/', list);
router.delete('/:id', auth, remove);
router.get('/waiting/:id', auth, waiting);

export default router;
