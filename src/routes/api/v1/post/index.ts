import { Router } from 'express';

// import list from './list';
import remove from './remove';
import write from './write';

const router = Router();

// router.use('/', list);
router.use('/', remove);
router.use('/', write);

export default router;
