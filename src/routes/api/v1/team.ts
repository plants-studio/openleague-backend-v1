import { Router } from 'express';

import accept from '../../../controllers/team/accept';
import create from '../../../controllers/team/create';
import join from '../../../controllers/team/join';
import list from '../../../controllers/team/list';
import remove from '../../../controllers/team/remove';
import waiting from '../../../controllers/team/waiting';
import auth from '../../../middleware/auth';

const router = Router();

router.put('/accept/:id', auth, accept);
router.post('/', create);
router.put('/:id', auth, join);
router.get('/', list);
router.delete('/:id', auth, remove);
router.get('/waiting/:id', auth, waiting);

export default router;
