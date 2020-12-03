import { Router } from 'express';

import {
  create, edit, list, read, remove,
} from '../../../controllers/league';
import auth from '../../../middleware/auth';

const router = Router();

router.post('/', auth, create);
router.get('/', list);
router.put('/:id', auth, edit);
router.get('/:id', read);
router.delete('/:id', auth, remove);

export default router;
