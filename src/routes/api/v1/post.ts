import { Router } from 'express';

import {
  list, read, remove, write,
} from '../../../controllers/post';
import auth from '../../../middleware/auth';

const router = Router();

router.get('/', list);
router.get('/:id', read);
router.delete('/:id', auth, remove);
router.post('/', auth, write);

export default router;
