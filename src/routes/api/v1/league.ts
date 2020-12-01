import { Router } from 'express';

import {
  create, list, remove,
} from '../../../controllers/league';
import auth from '../../../middleware/auth';

const router = Router();

router.post('/', auth, create);
router.get('/', list);
router.delete('/:id', auth, remove);

export default router;
