import { Router } from 'express';

import auth, { IRequest, IToken } from '../../../../middlewares/auth';
import Post, { IPost } from '../../../../models/Post';

const router = Router();

router.post('/', auth, async (req: IRequest, res) => {
  const verified: IToken | undefined = req.token;
  const { title, content, category } = req.body;
  if (!(title && content && category)) {
    res.sendStatus(412);
    return;
  }

  const newPost: IPost = new Post({
    title,
    content,
    writer: verified?.user?._id,
    category,
  });
  newPost.save((err: Error) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
});

export default router;
