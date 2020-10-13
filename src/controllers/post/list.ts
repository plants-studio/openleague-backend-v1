import { Request, Response } from 'express';

import games from '../../docs/games.json';
import Post from '../../models/Post';

export default async (req: Request, res: Response) => {
  const { page: tp, limit: tl } = req.query;
  if (!(tp && tl)) {
    res.sendStatus(412);
    return;
  }
  const page = Number.parseInt(tp!.toString(), 10);
  const limit = Number.parseInt(tl!.toString(), 10);
  let filter: Array<string> = req.body.category;
  if (!filter) {
    filter = games;
  }
  const list = await Promise.all(
    filter.map(async (category) => {
      const result = await Post.paginate({ category }, { page, limit });
      return result.docs;
    }),
  );
  res.status(200).send(list);
};
