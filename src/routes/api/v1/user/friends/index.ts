import { Router } from 'express';

import add from './add';
import list from './list';
import remove from './remove';

const router = Router();

router.use('/', add);
router.use('/', list);
router.use('/', remove);

export default router;
