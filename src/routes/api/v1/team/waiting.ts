import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../middlewares/auth';
import Team, { ITeam } from '../../../../models/Team';

const router = Router();

router.get('/:id', auth, async (req: IRequest, res) => {
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

  if (team.member?.find(token?.user?._id) || team.leader !== token?.user?._id) {
    res.sendStatus(403);
  }

  res.status(200).send(team.waiting);
});

export default router;
