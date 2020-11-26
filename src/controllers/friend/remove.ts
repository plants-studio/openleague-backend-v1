import { Response } from 'express';

import { IRequest, IToken } from '../../middleware/auth';
import Friend, { IFriend } from '../../models/Friend';
import User, { IUser } from '../../models/User';

export default async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const target: IUser = await User.findById(id);

  const myFriend: IFriend = await Friend.findById(token?.user?.friend);
  const targetFriend: IFriend = await Friend.findById(target.friend);
  if (!(myFriend && targetFriend)) {
    res.sendStatus(404);
    return;
  }

  await myFriend.updateOne({ $pull: { friends: id } });
  await targetFriend.updateOne({ $pull: { friends: token?.user?._id } });
  res.sendStatus(200);
};
