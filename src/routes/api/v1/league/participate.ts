import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../middlewares/auth';
import League, { ILeague } from '../../../../models/League';
import { ITeam } from '../../../../models/Team';

const router = Router();

router.put('/:id', auth, async (req: IRequest, res) => {
  const { token }: IToken = req;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const { team }: { team?: ITeam } = req.body;
  if (!team) {
    res.sendStatus(412);
    return;
  }

  if (token !== team.leader) {
    res.sendStatus(403);
    return;
  }

  const league: ILeague = await League.findById(id);
  if (!league) {
    res.sendStatus(404);
    return;
  }

  if (league.teamMax === league.teams?.length) {
    res.sendStatus(409);
    return;
  }

  if (league.teams?.find(team._id)) {
    res.sendStatus(409);
    return;
  }

  league.updateOne({ $push: { teams: team._id } }, (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
});

export default router;
