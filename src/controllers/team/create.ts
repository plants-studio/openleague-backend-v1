import { Response } from 'express';

import { IRequest, IToken } from '../../middlewares/auth';
import Team, { ITeam } from '../../models/Team';

export default (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { name, introduce, isPublic }: ITeam = req.body;
  if (!(name && introduce && isPublic)) {
    res.sendStatus(412);
    return;
  }

  const newTeam = new Team({
    name,
    introduce,
    leader: token?.user?._id,
    isPublic,
  });
  newTeam.save((err: Error) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
};
