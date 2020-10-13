import { Router } from 'express';

import list from '../../../controllers/post/list';
import remove from '../../../controllers/post/remove';
import write from '../../../controllers/post/write';
import auth from '../../../middlewares/auth';

const router = Router();

router.get('/', list);
router.delete('/:id', auth, remove);
router.post('/', auth, write);

export default router;
