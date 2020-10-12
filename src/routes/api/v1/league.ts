import { Router } from 'express';

import create from '../../../controllers/league/create';
import list from '../../../controllers/league/list';
import participate from '../../../controllers/league/participate';
import remove from '../../../controllers/league/remove';
import auth from '../../../middlewares/auth';

const router = Router();

router.get('/', list);
router.post('/', auth, create);
router.put('/:id', auth, participate);
router.delete('/:id', auth, remove);

export default router;
