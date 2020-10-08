import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../../middlewares/auth';
import Friends, { IFriends } from '../../../../../models/Friends';

const router = Router();

router.delete('/:id', auth, async (req: IRequest, res) => {
  const verified: IToken | undefined = req.token;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const friends: IFriends = await Friends.findOne({ user: verified?.user?._id });
  if (!friends) {
    res.sendStatus(404);
    return;
  }

  await friends.updateOne({ $pull: { friends: { id } } });
  res.sendStatus(200);
});

export default router;
