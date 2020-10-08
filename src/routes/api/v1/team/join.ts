import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../middlewares/auth';
import Team, { ITeam } from '../../../../models/Team';

const router = Router();

router.put('/:id', auth, async (req: IRequest, res) => {
  const { token }: IToken = req;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const team: ITeam = await Team.findById(id);
  if (!team) {
    res.sendStatus(404);
    return;
  }

  team.updateOne({ $push: { waiting: token?.user?._id } }, (err: Error) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
});

export default router;
