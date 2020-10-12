import { Response } from 'express';

import { IRequest, IToken } from '../../middlewares/auth';
import Friend, { IFriend } from '../../models/Friend';
import User, { IUser } from '../../models/User';

export default async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { name } = req.params;
  if (!name) {
    res.sendStatus(412);
    return;
  }

  const target: IUser = await User.findOne({ name });
  if (!target) {
    res.status(404).send('유저를 찾을 수 없습니다.');
    return;
  }

  const myFriend: IFriend = await Friend.findOne({ user: token?.user?._id });
  const targetFriend: IFriend = await Friend.findOne({ user: target._id });
  if (!(myFriend && targetFriend)) {
    res.status(404).send('친구 데이터를 찾을 수 없습니다.');
    return;
  }

  if (myFriend.applying?.find(target._id as any)) {
    res.sendStatus(409);
    return;
  }
  if (targetFriend.applying?.find(token?.user?._id)) {
    await targetFriend.updateOne({
      $push: { friends: token?.user?._id },
      $pull: { applying: token?.user?._id },
    });
    await myFriend.updateOne({
      $push: { friends: target._id },
      $pull: { waiting: target._id },
    });
    res.status(200).send('친구 신청을 수락했습니다.');
    return;
  }

  await myFriend.updateOne({ $push: { applying: target._id } });
  await targetFriend.updateOne({ $push: { waiting: token?.user?._id } });
  res.status(200).send('친구 신청을 보냈습니다.');
};
