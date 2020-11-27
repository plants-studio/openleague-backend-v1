import { Router } from 'express';

import { check, send } from '../../../controllers/notification';
import auth from '../../../middleware/auth';

const router = Router();

router.post('/', auth, send);
router.get('/', auth, check);

export default router;
