import DiscordOAuth2 from 'discord-oauth2';
import { Request, Response } from 'express';

import Whitelist from '../../models/Whitelist';

export default async (req: Request, res: Response) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    const token = req.headers.authorization.substring(7);
    if (token.split('.').length === 3) {
      await Whitelist.findOneAndDelete({ token });
      res.sendStatus(200);
    } else {
      const oauth = new DiscordOAuth2();
      oauth.revokeToken(
        token,
        Buffer.from(`${process.env.DISCORD_ID}:${process.env.DISCORD_SECRET}`).toString('base64'),
      );
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(401);
  }
};
