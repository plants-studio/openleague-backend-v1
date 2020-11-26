import { Request, Response } from 'express';

import Post from '../../models/Post';

export default async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const post = await Post.findById(id);
  if (!post) {
    res.sendStatus(404);
    return;
  }

  res.status(200).send(post);
};
