import { Router } from 'express';

import add from './add';
import list from './list';
import remove from './remove';
// import waiting from './waiting';

const router = Router();

router.use('/', add);
router.use('/', list);
router.use('/', remove);
// router.use('/waiting', waiting);

export default router;
