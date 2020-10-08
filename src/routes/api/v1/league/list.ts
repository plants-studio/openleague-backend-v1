import { Router } from 'express';

import games from '../../../../docs/games.json';
import League from '../../../../models/League';

const router = Router();

router.get('/', async (req, res) => {
  const { page: tp, limit: tl } = req.query;
  if (!(tp && tl)) {
    res.sendStatus(412);
    return;
  }
  const page = Number.parseInt(tp!.toString(), 10);
  const limit = Number.parseInt(tl!.toString(), 10);
  let filter: Array<string> = req.body.game;
  if (!filter) {
    filter = games;
  }
  const list: Array<any> = [];
  await Promise.all(
    filter.map(async (game) => {
      const result = await League.paginate({ game }, { page, limit });
      list.push(result.docs);
    }),
  );
  res.status(200).send(list);
});

export default router;
