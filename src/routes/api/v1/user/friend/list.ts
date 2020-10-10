import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../../middlewares/auth';
import Friend, { IFriend } from '../../../../../models/Friend';

const router = Router();

router.get('/', auth, async (req: IRequest, res) => {
  const { token }: IToken = req;
  const list: IFriend = await Friend.findOne({ user: token?.user?._id });
  if (!list) {
    res.sendStatus(404);
    return;
  }
  list.user = undefined;
  res.status(200).send(list);
});

export default router;
