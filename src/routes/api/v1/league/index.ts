import { Router } from 'express';

import create from './create';
import list from './list';
import participate from './participate';
import remove from './remove';

const router = Router();

router.use('/', create);
router.use('/', list);
router.use('/', participate);
router.use('/', remove);

export default router;
