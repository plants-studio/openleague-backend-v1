import { Router } from 'express';

import create from '../../../controllers/league/create';
import list from '../../../controllers/league/list';
import participate from '../../../controllers/league/participate';
import remove from '../../../controllers/league/remove';
import auth from '../../../middleware/auth';

const router = Router();

router.post('/', auth, create);
router.get('/', list);
router.put('/:id', auth, participate);
router.delete('/:id', auth, remove);

export default router;
