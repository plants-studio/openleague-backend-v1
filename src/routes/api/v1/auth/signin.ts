import { pbkdf2Sync } from 'crypto';
import { Router } from 'express';
import { sign } from 'jsonwebtoken';

import User, { IUser } from '../../../../models/User';

const router = Router();

router.post('/', async (req, res) => {
  const { email, password }: IUser = req.body;
  if (!(email && password)) {
    res.sendStatus(412);
    return;
  }

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

  res.status(200).send(token);
});

export default router;
