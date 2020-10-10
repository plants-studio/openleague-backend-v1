import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../../middlewares/auth';
import Friends, { IFriends } from '../../../../../models/Friends';

const router = Router();

router.get('/', auth, async (req: IRequest, res) => {
  const { token }: IToken = req;
  const list: IFriends = await Friends.findOne({ user: token?.user?._id });
  if (!list) {
    res.sendStatus(404);
    return;
  }
  list.user = undefined;
  res.status(200).send(list);
});

export default router;
