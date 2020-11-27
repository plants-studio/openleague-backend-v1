import { Router } from 'express';

import { add, list, remove } from '../../../controllers/friend';
import auth from '../../../middleware/auth';

const router = Router();

router.put('/:name', auth, add);
router.get('/', auth, list);
router.delete('/:id', auth, remove);

export default router;
