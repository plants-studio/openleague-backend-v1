import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../../middlewares/auth';
import Friend, { IFriend } from '../../../../../models/Friend';

const router = Router();

router.put('/:id', auth, async (req: IRequest, res) => {
  const { token }: IToken = req;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const myFriend: IFriend = await Friend.findOne({ user: token?.user?._id });
  const targetFriend: IFriend = await Friend.findOne({ user: id });
  if (!(myFriend && targetFriend)) {
    res.sendStatus(404);
    return;
  }

  if (myFriend.applying?.find(id as any)) {
    res.sendStatus(409);
    return;
  }
  if (targetFriend.applying?.find(token?.user?._id)) {
    await targetFriend.updateOne({
      $push: { friends: token?.user?._id },
      $pull: { applying: token?.user?._id },
    });
    await myFriend.updateOne({
      $push: { friends: id },
      $pull: { waiting: id },
    });
    res.status(200).send('친구 신청을 수락했습니다.');
    return;
  }

  await myFriend.updateOne({ $push: { applying: id } });
  await targetFriend.updateOne({ $push: { waiting: token?.user?._id } });
  res.status(200).send('친구 신청을 보냈습니다.');
});

export default router;
