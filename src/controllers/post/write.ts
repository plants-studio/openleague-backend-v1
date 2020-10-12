import { Response } from 'express';

import { IRequest, IToken } from '../../middlewares/auth';
import Post, { IPost } from '../../models/Post';

export default async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { title, content, category }: IPost = req.body;
  if (!(title && content && category)) {
    res.sendStatus(412);
    return;
  }

  const newPost: IPost = new Post({
    title,
    content,
    writer: token?.user?._id,
    category,
  });

  await newPost.save();
  res.sendStatus(200);
};
