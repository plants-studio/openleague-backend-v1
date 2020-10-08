import { Router } from 'express';

import add from './add';
import remove from './remove';

const router = Router();

router.use('/', add);
router.use('/', remove);

export default router;
