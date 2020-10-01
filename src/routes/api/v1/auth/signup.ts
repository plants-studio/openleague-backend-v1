import { pbkdf2Sync, randomBytes } from 'crypto';
import { Router } from 'express';

import User from '../../../../models/User';

const router = Router();

router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  if (!(name && email && password)) {
    res.sendStatus(412);
    return;
  }

  const nameCheck = await User.findOne({ name });
  if (nameCheck) {
    res.status(409).send('이미 같은 이름이 존재합니다');
  }

  const emailCheck = await User.findOne({ email });
  if (emailCheck) {
    res.status(409).send('이미 같은 이메일이 존재합니다');
    return;
  }

  const salt = randomBytes(16).toString('base64');
  const encrypt = pbkdf2Sync(password, salt, 100000, 64, 'SHA512').toString('base64');
  const newUser = new User({
    name,
    email,
    password: `${encrypt}|${salt}`,
  });
  newUser.save((err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
});

export default router;
