import { Router } from 'express';

import { add, check } from '../../../controllers/notification';
import auth from '../../../middleware/auth';

const router = Router();

router.post('/', auth, add);
router.get('/', auth, check);

export default router;
