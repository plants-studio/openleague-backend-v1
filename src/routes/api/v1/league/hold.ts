import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../middlewares/auth';
import League from '../../../../models/League';

const router = Router();

router.post('/', auth, (req: IRequest, res) => {
  const verified: IToken | undefined = req.token;
  const {
    game, max, member, reward,
  } = req.body;
  if (!(game && max && member && reward)) {
    res.sendStatus(412);
    return;
  }

  const newLeague = new League({
    host: verified?.user?.email,
    game,
    max,
    member,
    reward,
  });
  newLeague.save((err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
});

export default router;
