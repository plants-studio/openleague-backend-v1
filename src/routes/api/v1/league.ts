import { Router } from 'express';

import {
  apply, create, edit, list, members, read, remove,
} from '../../../controllers/league';
import auth from '../../../middleware/auth';

const router = Router();

router.post('/', auth, create);
router.get('/', list);
router.put('/:id', auth, edit);
router.post('/:id', apply);
router.get('/members/:id', members);
router.get('/:id', read);
router.delete('/:id', auth, remove);

export default router;
