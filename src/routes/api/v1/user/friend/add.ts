import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../../middlewares/auth';
import Friend, { IFriend } from '../../../../../models/Friend';

const router = Router();

router.put('/', auth, async (req: IRequest, res) => {
  const { token }: IToken = req;
  const { target } = req.body;
  if (!target) {
    res.sendStatus(412);
    return;
  }

  const myFriend: IFriend = await Friend.findById(token?.user?._id);
  const targetFriend: IFriend = await Friend.findById(target);
  if (!(myFriend && targetFriend)) {
    res.sendStatus(404);
    return;
  }

  if (myFriend.applying?.find(target)) {
    res.sendStatus(409);
    return;
  }
  if (targetFriend.applying?.find(token?.user?._id)) {
    await targetFriend.updateOne({
      $push: { friends: token?.user?._id },
      $pull: { applying: token?.user?._id },
    });
    await myFriend.updateOne({
      $push: { friends: target },
      $pull: { waiting: target },
    });
    res.status(200).send('친구 신청을 수락했습니다.');
    return;
  }

  await myFriend.updateOne({ $push: { applying: target } });
  await targetFriend.updateOne({ $push: { waiting: token?.user?._id } });
  res.status(200).send('친구 신청을 보냈습니다.');
});

export default router;
