import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../middlewares/auth';
import Team, { ITeam } from '../../../../models/Team';
import User, { IUser } from '../../../../models/User';

const router = Router();

router.put('/:id', auth, async (req: IRequest, res) => {
  const { token }: IToken = req;
  const { id } = req.params;
  const { userId } = req.body;
  if (!(id && userId)) {
    res.sendStatus(412);
    return;
  }

  const team: ITeam = await Team.findById(id);
  if (!team) {
    res.status(404).send('팀이 존재하지 않습니다.');
  }

  const user: IUser = await User.findById(userId);
  if (!user) {
    res.status(404).send('유저가 존재하지 않습니다.');
    return;
  }

  if (token?.user?._id !== team.leader) {
    res.sendStatus(403);
    return;
  }

  if (team.member?.find(user._id)) {
    res.status(409).send('유저가 이미 팀에 속해있습니다.');
    return;
  }

  if (!team.waiting?.find(user._id)) {
    res.status(409).send('유저가 가입 신청을 넣지 않았습니다.');
    return;
  }

  await team.updateOne({ $push: { member: user._id } });
  await team.updateOne({ $pull: { waiting: user._id } });
  res.sendStatus(200);
});

export default router;
