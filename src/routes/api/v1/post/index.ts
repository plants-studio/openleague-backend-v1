import { Router } from 'express';

import remove from './remove';
import write from './write';

const router = Router();

router.use('/', remove);
router.use('/write', write);

export default router;
