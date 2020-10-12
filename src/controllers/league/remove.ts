import { Response } from 'express';

import { IRequest, IToken } from '../../middlewares/auth';
import League, { ILeague } from '../../models/League';

export default async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const league: ILeague = await League.findById(id);
  if (!league) {
    res.sendStatus(404);
    return;
  }

  if (league.host !== token?.user?._id) {
    res.sendStatus(403);
    return;
  }

  league.deleteOne((err: Error) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
};
