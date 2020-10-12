import { Response } from 'express';

import { IRequest, IToken } from '../../middlewares/auth';
import Friend, { IFriend } from '../../models/Friend';

export default async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const friend: IFriend = await Friend.findOne({ user: token?.user?._id });
  if (!friend) {
    res.sendStatus(404);
    return;
  }

  friend.updateOne({ $pull: { friends: { id } } }, (err: Error) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
};
