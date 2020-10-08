import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../../middlewares/auth';
import Friends, { IFriends } from '../../../../../models/Friends';

const router = Router();

router.delete('/:id', auth, async (req: IRequest, res) => {
  const { token }: IToken = req;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const friends: IFriends = await Friends.findOne({ user: token?.user?._id });
  if (!friends) {
    res.sendStatus(404);
    return;
  }

  friends.updateOne({ $pull: { friends: { id } } }, (err: Error) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
});

export default router;
