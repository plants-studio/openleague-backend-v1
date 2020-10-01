import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

import { IUser } from '../models/User';

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const verified = JSON.parse(JSON.stringify(verify(token!, process.env.ACCESS_KEY!)));
    req.token = verified;
    next();
  } catch {
    res.sendStatus(401);
  }
};

export interface IToken {
  user?: IUser;
}
