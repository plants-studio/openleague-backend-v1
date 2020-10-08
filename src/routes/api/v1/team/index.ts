import { Router } from 'express';

// import accept from './accept';
import create from './create';
import join from './join';
import list from './list';
// import remove from './remove';
// import waiting from './waiting';

const router = Router();

// router.use('/accept', accept);
router.use('/', create);
router.use('/', join);
router.use('/', list);
// router.use('/', remove);
// router.use('/waiting', waiting);

export default router;
