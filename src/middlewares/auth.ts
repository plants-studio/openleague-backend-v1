import DiscordOauth2 from 'discord-oauth2';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

import User, { IUser } from '../models/User';
import Whitelist from '../models/Whitelist';

export interface IRequest extends Request {
  token?: object;
}

export interface IToken {
  token?: {
    user?: IUser;
  };
}

export default async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      if (token.split('.').length === 3) {
        const verified = JSON.parse(JSON.stringify(verify(token, process.env.ACCESS_KEY!)));
        if (!verified) {
          res.sendStatus(401);
          return;
        }
        const whitelist = await Whitelist.findOne({ token });
        if (!whitelist) {
          res.sendStatus(401);
          return;
        }
        req.token = verified;
        next();
      } else {
        const oauth = new DiscordOauth2();
        const user = await oauth.getUser(token);
        if (!user.verified) {
          res.sendStatus(401);
          return;
        }
        const userData = await User.findOne({ discord: user.id });
        if (!userData) {
          res.sendStatus(404);
          return;
        }
        req.token = userData;
        next();
      }
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(401);
  }
};
