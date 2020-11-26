import DiscordOAuth2 from 'discord-oauth2';
import { Response } from 'express';
import { sign, verify } from 'jsonwebtoken';

import { IRequest } from '../../middleware/auth';
import Whitelist, { IWhitelist } from '../../models/Whitelist';

export default async (req: IRequest, res: Response) => {
  try {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      const refreshToken = req.headers.authorization.substring(7);
      if (refreshToken.split('.').length !== 3) {
        const oauth = new DiscordOAuth2();
        const token = await oauth.tokenRequest({
          scope: 'identify',
          grantType: 'refresh_token',
          refreshToken,
          redirectUri: process.env.REDIRECT_URI,
          clientId: process.env.DISCORD_ID,
          clientSecret: process.env.DISCORD_SECRET,
        });
        res.status(200).send(token);
      } else {
        const whitelist = await Whitelist.findOne({ token: refreshToken });
        if (!whitelist) {
          res.sendStatus(401);
          return;
        }
        const verified = JSON.parse(JSON.stringify(verify(refreshToken, process.env.REFRESH_KEY!)));
        const accessToken = sign({ user: verified.user }, process.env.ACCESS_KEY!, { expiresIn: '7h' });
        const newRefreshToken = sign({ user: verified.user }, process.env.REFRESH_KEY!, { expiresIn: '7d' });

        const whiteAccess: IWhitelist = new Whitelist({
          token: accessToken,
        });
        const whiteRefresh: IWhitelist = new Whitelist({
          token: newRefreshToken,
        });
        const token = {
          accessToken,
          refreshToken: newRefreshToken,
        };

        await whiteAccess.save();
        await whiteRefresh.save();
        res.status(200).send(token);
      }
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(401);
  }
};
