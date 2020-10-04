import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../../middlewares/auth';
import User, { IUser } from '../../../../../models/User';

const router = Router();

router.post('/', auth, async (req: IRequest, res) => {
  const verified: IToken | undefined = req.token;
  const { target } = req.body;
  if (!target) {
    res.sendStatus(412);
    return;
  }
  if (verified?.user?.applying?.find(target)) {
    res.sendStatus(409);
    return;
  }

  const user: IUser = await User.findById(target);
  if (!user) {
    res.sendStatus(404);
    return;
  }

  if (user.applying?.find(verified?.user?._id)) {
    await user.updateOne({
      $push: { friends: verified?.user?._id },
      $pull: { applying: verified?.user?._id },
    });
    await verified?.user?.updateOne({
      $push: { friends: target },
      $pull: { waiting: target },
    });
    res.status(200).send('친구 신청을 수락했습니다.');
    return;
  }

  await user.updateOne({ $push: { waiting: verified?.user?._id } });
  await verified?.user?.updateOne({ $push: { applying: target } });
  res.status(200).send('친구 신청을 보냈습니다.');
});

export default router;
