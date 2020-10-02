import { Router } from 'express';

import hold from './hold';
import participate from './participate';

const router = Router();

router.use('/hold', hold);
router.use('/participate', participate);

export default router;
