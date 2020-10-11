import DiscordOAuth2 from 'discord-oauth2';
import { Router } from 'express';
import { sign, verify } from 'jsonwebtoken';

import { IRequest } from '../../../../middlewares/auth';
import Whitelist, { IWhitelist } from '../../../../models/Whitelist';

const router = Router();

router.post('/', async (req: IRequest, res) => {
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
        const user = JSON.parse(JSON.stringify(verify(refreshToken, process.env.REFRESH_KEY!)));
        const accessToken = sign({ user }, process.env.ACCESS_KEY!);
        const newRefreshToken = sign({ user }, process.env.REFRESH_KEY!);

        const whiteAccess: IWhitelist = new Whitelist({
          token: accessToken,
        });
        const whiteRefresh: IWhitelist = new Whitelist({
          token: newRefreshToken,
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

            const token = {
              accessToken,
              refreshToken: newRefreshToken,
            };
            res.status(200).send({ token });
          });
        });
      }
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(401);
  }
});

export default router;
