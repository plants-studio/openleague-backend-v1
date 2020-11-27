import { Response } from 'express';

import { IRequest, IToken } from '../middleware/auth';
import Friend, { IFriend } from '../models/Friend';
import User, { IUser } from '../models/User';

export const add = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  let { name } = req.params;
  if (!name) {
    res.sendStatus(412);
    return;
  }
  name = name.replace('|', '#');

  const target: IUser = await User.findOne({ name });
  if (!target) {
    res.status(404).send('유저를 찾을 수 없습니다.');
    return;
  }

  const myFriend: IFriend = await Friend.findById(token?.user?.friend);
  const targetFriend: IFriend = await Friend.findById(target.friend);
  if (!(myFriend && targetFriend)) {
    res.status(404).send('친구 데이터를 찾을 수 없습니다.');
    return;
  }

  if (myFriend.applying?.find((data) => data.toString() === target._id.toString())) {
    res.status(409).send('이미 친구 신청을 보냈습니다.');
    return;
  }
  if (myFriend.friends?.find((data) => data.toString() === target._id.toString())) {
    res.status(409).send('이미 친구입니다.');
    return;
  }
  if (myFriend.waiting?.find((data) => data.toString() === target._id.toString())) {
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

export const list = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const friendList: IFriend = await Friend.findById(token?.user?.friend);
  if (!friendList) {
    res.sendStatus(404);
    return;
  }

  const result = await Promise.all(
    friendList.friends!.map(async (id) => {
      const user: IUser = await User.findById(id);
      user.admin = undefined;
      user.password = undefined;
      user.discord = undefined;
      return user;
    }),
  );

  res.status(200).send(result);
};

export const remove = async (req: IRequest, res: Response) => {
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
