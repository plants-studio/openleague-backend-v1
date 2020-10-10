import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../middlewares/auth';
import League, { ILeague } from '../../../../models/League';
import Team, { ITeam } from '../../../../models/Team';

const router = Router();

router.put('/:id', auth, async (req: IRequest, res) => {
  const { token }: IToken = req;
  const { id } = req.params;
  const { teamId } = req.body;
  if (!(id && teamId)) {
    res.sendStatus(412);
    return;
  }

  const team: ITeam = await Team.findById(teamId);
  if (!team) {
    res.status(404).send('팀이 존재하지 않습니다.');
    return;
  }

  const league: ILeague = await League.findById(id);
  if (!league) {
    res.status(404).send('리그가 존재하지 않습니다.');
    return;
  }

  if (token !== team.leader) {
    res.sendStatus(403);
    return;
  }

  if (league.teamMax === league.teams?.length) {
    res.status(409).send('리그에 참여할 자리가 없습니다.');
    return;
  }

  if (league.teams?.find(team._id)) {
    res.status(409).send('이미 리그에 참여 중입니다.');
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
