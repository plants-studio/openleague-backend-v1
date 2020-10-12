import { Router } from 'express';

import accept from '../../../controllers/team/accept';
import create from '../../../controllers/team/create';
import join from '../../../controllers/team/join';
import list from '../../../controllers/team/list';
import remove from '../../../controllers/team/remove';
import waiting from '../../../controllers/team/waiting';
import auth from '../../../middlewares/auth';

const router = Router();

router.get('/', list);
router.get('/waiting/:id', auth, waiting);
router.post('/', create);
router.put('/accept/:id', auth, accept);
router.put('/:id', auth, join);
router.delete('/:id', auth, remove);

export default router;
