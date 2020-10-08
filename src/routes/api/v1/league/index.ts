import { Router } from 'express';

import hold from './hold';
import list from './list';
import participate from './participate';
import remove from './remove';

const router = Router();

router.use('/hold', hold);
router.use('/list', list);
router.use('/participate', participate);
router.use('/', remove);

export default router;
