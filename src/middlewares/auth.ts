import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

import { IUser } from '../models/User';

export interface IRequest extends Request {
  token?: object;
}

export interface IToken {
  token?: {
    user?: IUser;
  };
}

export default (req: IRequest, res: Response, next: NextFunction) => {
  try {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      const verified = JSON.parse(JSON.stringify(verify(token!, process.env.ACCESS_KEY!)));
      req.token = verified;
      next();
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(401);
  }
};
