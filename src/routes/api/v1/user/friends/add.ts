import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../../middlewares/auth';
import Friends, { IFriends } from '../../../../../models/Friends';

const router = Router();

router.put('/', auth, async (req: IRequest, res) => {
  const { token }: IToken = req;
  const { target } = req.body;
  if (!target) {
    res.sendStatus(412);
    return;
  }

  const myFriends: IFriends = await Friends.findById(token?.user?._id);
  const targetFriends: IFriends = await Friends.findById(target);
  if (!(myFriends && targetFriends)) {
    res.sendStatus(404);
    return;
  }

  if (myFriends.applying?.find(target)) {
    res.sendStatus(409);
    return;
  }
  if (targetFriends.applying?.find(token?.user?._id)) {
    await targetFriends.updateOne({
      $push: { friends: token?.user?._id },
      $pull: { applying: token?.user?._id },
    });
    await myFriends.updateOne({
      $push: { friends: target },
      $pull: { waiting: target },
    });
    res.status(200).send('친구 신청을 수락했습니다.');
    return;
  }

  await myFriends.updateOne({ $push: { applying: target } });
  await targetFriends.updateOne({ $push: { waiting: token?.user?._id } });
  res.status(200).send('친구 신청을 보냈습니다.');
});

export default router;
