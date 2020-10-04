import { Router } from 'express';

import friends from './friends';

const router = Router();

router.use('/friends', friends);

export default router;
