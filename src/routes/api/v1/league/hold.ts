import { Router } from 'express';

import auth, { IToken } from '../../../../middlewares/auth';
import League from '../../../../models/League';

const router = Router();

router.post('/', auth, (req, res) => {
  const user: IToken | undefined = req.token;
  const {
    game, headcount, current, reward,
  } = req.body;
  if (!(game && headcount && current && reward)) {
    res.sendStatus(412);
    return;
  }

  const newLeague = new League({
    host: user?.user?.email,
    game,
    headcount,
    current,
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
