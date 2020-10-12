import { Response } from 'express';

import { IRequest, IToken } from '../../middlewares/auth';
import Friend, { IFriend } from '../../models/Friend';

export default async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const list: IFriend = await Friend.findOne({ user: token?.user?._id });
  if (!list) {
    res.sendStatus(404);
    return;
  }
  list.user = undefined;
  res.status(200).send(list);
};
