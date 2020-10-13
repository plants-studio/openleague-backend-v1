import { Response } from 'express';

import { IRequest, IToken } from '../../middlewares/auth';
import Friend, { IFriend } from '../../models/Friend';
import User, { IUser } from '../../models/User';

export default async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const friendList: IFriend = await Friend.findOne({ user: token?.user?._id });
  if (!friendList) {
    res.sendStatus(404);
    return;
  }

  const list = await Promise.all(
    friendList.friends!.map(async (id) => {
      const user: IUser = await User.findById(id);
      user.admin = undefined;
      user.password = undefined;
      user.discord = undefined;
      return user;
    }),
  );

  res.status(200).send(list);
};
