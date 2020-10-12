import { Router } from 'express';

import list from '../../../controllers/post/list';
import remove from '../../../controllers/post/remove';
import write from '../../../controllers/post/write';
import auth from '../../../middlewares/auth';

const router = Router();

router.get('/', list);
router.post('/', auth, write);
router.delete('/:id', auth, remove);

export default router;
