import { Request, Response } from 'express';
import { PaginateResult } from 'mongoose';

import category from '../../docs/category.json';
import Post, { IPost } from '../../models/Post';

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
    filter = category;
  }
  const list = await Promise.all(
    filter.map(async (cate) => {
      const result1: PaginateResult<IPost> = await Post.paginate(
        { category: cate },
        { page, limit },
      );
      const result2 = await Promise.all(
        result1.docs.map((data) => {
          const temp = data;
          temp.content = undefined;
          return temp;
        }),
      );
      return result2;
    }),
  );
  res.status(200).send(list);
};
