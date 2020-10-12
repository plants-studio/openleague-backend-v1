import { Response } from 'express';

import { IRequest, IToken } from '../../middlewares/auth';
import League, { ILeague } from '../../models/League';

export default (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const {
    title, content, fee, game, teamMin, teamMax, teamReqMemCnt, reward,
  }: ILeague = req.body;
  if (!(title && content && fee && game && teamMin && teamMax && teamReqMemCnt && reward)) {
    res.sendStatus(412);
    return;
  }
  if (title.length < 5 || title.length > 20) {
    res.status(412).send('제목의 길이가 적절하지 않습니다. 5자 이상, 20자 이하로 해주세요.');
    return;
  }

  const newLeague: ILeague = new League({
    title,
    content,
    fee,
    host: token?.user?._id,
    game,
    teamMin,
    teamMax,
    teamReqMemCnt,
    reward,
  });
  newLeague.save((err: Error) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
};
