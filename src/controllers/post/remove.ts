import { Response } from 'express';

import { IRequest, IToken } from '../../middleware/auth';
import Post, { IPost } from '../../models/Post';

export default async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
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

  if (post.writer !== token?.user?._id) {
    res.sendStatus(403);
    return;
  }

  await post.deleteOne();
  res.sendStatus(200);
};
