import { Router } from 'express';

import Team from '../../../../models/Team';

const router = Router();

router.get('/', async (req, res) => {
  const { page: tp, limit: tl } = req.query;
  if (!(tp && tl)) {
    res.sendStatus(412);
    return;
  }
  const page = Number.parseInt(tp!.toString(), 10);
  const limit = Number.parseInt(tl!.toString(), 10);
  const list = await Team.paginate({ isPublic: true }, { page, limit });
  res.status(200).send(list);
});

export default router;
