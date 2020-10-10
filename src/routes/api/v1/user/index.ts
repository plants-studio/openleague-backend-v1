import { Router } from 'express';

import friend from './friend';

const router = Router();

router.use('/friend', friend);

export default router;
