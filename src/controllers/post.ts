import { Request, Response } from 'express';
import { PaginateResult } from 'mongoose';

import category from '../docs/category.json';
import { IRequest, IToken } from '../middleware/auth';
import Post, { IPost } from '../models/Post';

const flat = (arr: Array<any>, d = 1): Array<any> => (d > 0
  ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flat(val, d - 1) : val), [])
  : arr.slice());

export const list = async (req: Request, res: Response) => {
  const { page: tp, limit: tl, search } = req.query;
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
  const result = await Promise.all(
    filter.map(async (cate) => {
      if (search) {
        const result1: PaginateResult<IPost> = await Post.paginate(
          { category: cate, $text: { $search: search as string } },
          { page, limit, sort: { timestamp: -1 } },
        );
        const result2 = await Promise.all(
          result1.docs.map((data) => {
            const temp = data;
            temp.content = undefined;
            temp.comment = undefined;
            return temp;
          }),
        );
        return result2;
      }

      const result1: PaginateResult<IPost> = await Post.paginate(
        { category: cate },
        { page, limit, sort: { timestamp: -1 } },
      );
      const result2 = await Promise.all(
        result1.docs.map((data) => {
          const temp = data;
          temp.content = undefined;
          temp.comment = undefined;
          return temp;
        }),
      );
      return result2;
    }),
  );
  res.status(200).send(flat(result, Infinity));
};

export const read = async (req: Request, res: Response) => {
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

export const remove = async (req: IRequest, res: Response) => {
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

export const write = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { title, content, category: cate }: IPost = req.body;
  if (!(title && content && cate)) {
    res.sendStatus(412);
    return;
  }

  const newPost: IPost = new Post({
    title,
    content,
    writer: token?.user?._id,
    category: cate,
  });

  await newPost.save();
  res.sendStatus(200);
};
