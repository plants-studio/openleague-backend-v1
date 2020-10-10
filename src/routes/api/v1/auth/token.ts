import { Router } from 'express';
import { sign, verify } from 'jsonwebtoken';

import { IRequest } from '../../../../middlewares/auth';

const router = Router();

router.post('/', (req: IRequest, res) => {
  try {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      const user = JSON.parse(JSON.stringify(verify(token, process.env.REFRESH_KEY!)));
      const access = sign({ user }, process.env.ACCESS_KEY!);
      res.status(200).send(access);
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(401);
  }
});

export default router;
