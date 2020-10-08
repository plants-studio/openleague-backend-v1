import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../middlewares/auth';
import Post, { IPost } from '../../../../models/Post';

const router = Router();

router.delete('/:id', auth, async (req: IRequest, res) => {
  const verified: IToken | undefined = req.token;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const post: IPost = await Post.findById(id);
  if (!post) {
    res.sendStatus(404);
    return;
  }

  if (post.writer !== verified?.user?._id) {
    res.sendStatus(403);
    return;
  }

  await post.deleteOne();
  res.sendStatus(200);
});

export default router;
