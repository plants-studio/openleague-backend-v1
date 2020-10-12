import { pbkdf2Sync } from 'crypto';
import DiscordOauth2 from 'discord-oauth2';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';

import User, { IUser } from '../../models/User';
import Whitelist, { IWhitelist } from '../../models/Whitelist';

export default async (req: Request, res: Response) => {
  const { discord } = req.body;
  const { email, password }: IUser = req.body;

  if (discord) {
    const oauth = new DiscordOauth2();
    const user = await oauth.getUser(discord);
    if (!user.verified) {
      res.sendStatus(401);
      return;
    }

    const userData = await User.findOne({ discord: user.id });
    if (!userData) {
      const newUser: IUser = new User({
        email: user.email,
        name: `${user.username}#${user.discriminator}`,
        discord: user.id,
      });

      newUser.save((err: Error) => {
        if (err) {
          console.error(err);
          res.sendStatus(500);
          return;
        }

        res.sendStatus(200);
      });
      return;
    }

    res.sendStatus(200);
  } else if (email && password) {
    const user: IUser = await User.findOne({ email });
    if (!user) {
      res.sendStatus(404);
      return;
    }

    const temp = user.password?.split('|');
    if (!temp) {
      res.sendStatus(500);
      return;
    }

    const encrypt = pbkdf2Sync(password, temp[1], 100000, 64, 'SHA512').toString('base64');
    if (encrypt !== temp[0]) {
      res.sendStatus(401);
      return;
    }

    user.password = undefined;

    const accessToken = sign({ user }, process.env.ACCESS_KEY!, { expiresIn: '7h' });
    const refreshToken = sign({ user }, process.env.REFRESH_KEY!, { expiresIn: '7d' });
    const token = {
      accessToken,
      refreshToken,
    };

    const whiteAccess: IWhitelist = new Whitelist({
      token: accessToken,
    });
    const whiteRefresh: IWhitelist = new Whitelist({
      token: refreshToken,
    });

    whiteAccess.save((accessErr: Error) => {
      if (accessErr) {
        console.error(accessErr);
        res.sendStatus(500);
        return;
      }

      whiteRefresh.save((refreshErr: Error) => {
        if (refreshErr) {
          console.error(refreshErr);
          res.sendStatus(500);
          return;
        }

        res.status(200).send(token);
      });
    });
  } else {
    res.sendStatus(412);
  }
};
