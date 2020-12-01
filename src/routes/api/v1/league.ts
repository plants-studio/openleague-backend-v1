import { Router } from 'express';

import {
  create, list, read, remove,
} from '../../../controllers/league';
import auth from '../../../middleware/auth';

const router = Router();

router.post('/', auth, create);
router.get('/', list);
router.get('/:id', read);
router.delete('/:id', auth, remove);

export default router;
