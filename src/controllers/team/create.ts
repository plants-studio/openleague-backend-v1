import { Response } from 'express';

import { IRequest, IToken } from '../../middleware/auth';
import Team, { ITeam } from '../../models/Team';

export default async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { name, introduce, isPublic }: ITeam = req.body;
  if (!(name && introduce && isPublic)) {
    res.sendStatus(412);
    return;
  }

  const newTeam: ITeam = new Team({
    name,
    introduce,
    leader: token?.user?._id,
    isPublic,
  });

  await newTeam.save();
  res.sendStatus(200);
};
