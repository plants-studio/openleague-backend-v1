import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../middlewares/auth';
import League, { ILeague } from '../../../../models/League';

const router = Router();

router.put('/', auth, async (req: IRequest, res) => {
  const verified: IToken | undefined = req.token;
  const { _id } = req.body;
  if (!_id) {
    res.sendStatus(412);
    return;
  }

  const league: ILeague = await League.findById(_id);
  if (!league) {
    res.sendStatus(404);
    return;
  }

  if (league.member?.length === league.max) {
    res.sendStatus(409);
    return;
  }

  if (league.member?.find(verified?.user?._id)) {
    res.sendStatus(409);
    return;
  }

  league.updateOne({ $push: { member: verified?.user?._id } }, (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
});

export default router;
