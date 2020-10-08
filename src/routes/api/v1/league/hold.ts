import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../middlewares/auth';
import League, { ILeague } from '../../../../models/League';

const router = Router();

router.post('/', auth, (req: IRequest, res) => {
  const verified: IToken | undefined = req.token;
  const {
    title, content, game, max, member, reward,
  } = req.body;
  if (!(title && content && game && max && member && reward)) {
    res.sendStatus(412);
    return;
  }

  const newLeague: ILeague = new League({
    title,
    content,
    host: verified?.user?._id,
    game,
    max,
    member,
    reward,
  });
  newLeague.save((err: Error) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
});

export default router;
