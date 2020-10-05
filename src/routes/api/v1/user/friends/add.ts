import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../../middlewares/auth';
import Friends, { IFriends } from '../../../../../models/Friends';

const router = Router();

router.post('/', auth, async (req: IRequest, res) => {
  const verified: IToken | undefined = req.token;
  const { target } = req.body;
  if (!target) {
    res.sendStatus(412);
    return;
  }

  const myFriends: IFriends = await Friends.findById(verified?.user?._id);
  const targetFriends: IFriends = await Friends.findById(target);
  if (!(myFriends && targetFriends)) {
    res.sendStatus(404);
    return;
  }

  if (myFriends.applying?.find(target)) {
    res.sendStatus(409);
    return;
  }
  if (targetFriends.applying?.find(verified?.user?._id)) {
    await targetFriends.updateOne({
      $push: { friends: verified?.user?._id },
      $pull: { applying: verified?.user?._id },
    });
    await myFriends.updateOne({
      $push: { friends: target },
      $pull: { waiting: target },
    });
    res.status(200).send('친구 신청을 수락했습니다.');
    return;
  }

  await myFriends.updateOne({ $push: { applying: target } });
  await targetFriends.updateOne({ $push: { waiting: verified?.user?._id } });
  res.status(200).send('친구 신청을 보냈습니다.');
});

export default router;
