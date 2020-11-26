import { Router } from 'express';

import list from '../../../controllers/post/list';
import read from '../../../controllers/post/read';
import remove from '../../../controllers/post/remove';
import write from '../../../controllers/post/write';
import auth from '../../../middleware/auth';

const router = Router();

router.get('/', list);
router.get('/:id', read);
router.delete('/:id', auth, remove);
router.post('/', auth, write);

export default router;
