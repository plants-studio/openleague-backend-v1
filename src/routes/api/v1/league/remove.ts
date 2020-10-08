import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../middlewares/auth';
import League, { ILeague } from '../../../../models/League';

const router = Router();

router.delete('/:id', auth, async (req: IRequest, res) => {
  const verified: IToken | undefined = req.token;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const league: ILeague = await League.findById(id);
  if (!league) {
    res.sendStatus(404);
    return;
  }

  if (league.host !== verified?.user?._id) {
    res.sendStatus(403);
    return;
  }

  await league.deleteOne();
  res.sendStatus(200);
});

export default router;
