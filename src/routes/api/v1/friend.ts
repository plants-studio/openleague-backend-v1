import { Router } from 'express';

import add from '../../../controllers/friend/add';
import list from '../../../controllers/friend/list';
import remove from '../../../controllers/friend/remove';
import auth from '../../../middlewares/auth';

const router = Router();

router.put('/:name', auth, add);
router.get('/', auth, list);
router.delete('/:id', auth, remove);

export default router;
