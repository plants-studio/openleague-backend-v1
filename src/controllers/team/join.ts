import { Response } from 'express';

import { IRequest, IToken } from '../../middleware/auth';
import Team, { ITeam } from '../../models/Team';

export default async (req: IRequest, res: Response) => {
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

  await team.updateOne({ $push: { waiting: token?.user?._id } });
  res.sendStatus(200);
};
