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

      await newUser.save();
      const data = {
        email: user.email,
        name: newUser.name,
      };
      res.status(200).send(data);
    }
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

    await whiteAccess.save();
    await whiteRefresh.save();
    res.status(200).send(token);
  } else {
    res.sendStatus(412);
  }
};
