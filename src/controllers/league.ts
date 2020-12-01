import { Request, Response } from 'express';
import { PaginateResult } from 'mongoose';

import games from '../docs/games.json';
import { IRequest, IToken } from '../middleware/auth';
import League, { ILeague } from '../models/League';

export const create = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const {
    title,
    applicationDeadline,
    leagueStartDay,
    leagueEndDay,
    introduce,
    rule,
    thumbnail,
    game,
    teamMin,
    teamMax,
    teamReqMemCnt,
    placeType,
    discordLink,
    location,
  }: ILeague = req.body;
  if (
    !(
      title
      && applicationDeadline
      && leagueStartDay
      && leagueEndDay
      && introduce
      && rule
      && game
      && teamMin
      && teamMax
      && teamReqMemCnt
      && placeType
      && (placeType === 'online' ? discordLink : location)
    )
  ) {
    res.sendStatus(412);
    return;
  }
  if (title.length < 5 || title.length > 20) {
    res.status(412).send('제목의 길이가 적절하지 않습니다. 5자 이상, 20자 이하로 해주세요.');
    return;
  }

  const newLeague: ILeague = new League({
    title,
    applicationDeadline,
    leagueStartDay,
    leagueEndDay,
    introduce,
    rule,
    thumbnail,
    game,
    teamMin,
    teamMax,
    teamReqMemCnt,
    placeType,
    discordLink,
    location,
    host: token?.user?._id,
  });

  await newLeague.save();
  res.sendStatus(200);
};

export const list = async (req: Request, res: Response) => {
  const { page: tp, limit: tl, search } = req.query;
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
  const result = await Promise.all(
    filter.map(async (game) => {
      if (search) {
        const result1: PaginateResult<ILeague> = await League.paginate(
          { game, $text: { $search: search as string } },
          { page, limit },
        );
        const result2 = await Promise.all(
          result1.docs.map((data) => {
            const temp = data;
            temp.teams = undefined;
            temp.introduce = undefined;
            temp.rule = undefined;
            temp.discordLink = undefined;
            temp.location = undefined;
            return temp;
          }),
        );
        return result2;
      }
      const result1 = await League.paginate({ game }, { page, limit });
      const result2 = await Promise.all(
        result1.docs.map((data) => {
          const temp = data;
          temp.teams = undefined;
          temp.introduce = undefined;
          temp.rule = undefined;
          temp.discordLink = undefined;
          temp.location = undefined;
          return temp;
        }),
      );
      return result2;
    }),
  );
  res.status(200).send(result);
};

export const remove = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const league: ILeague = await League.findById(id);
  if (!league) {
    res.sendStatus(404);
    return;
  }

  if (league.host !== token?.user?._id) {
    res.sendStatus(403);
    return;
  }

  await league.deleteOne();
  res.sendStatus(200);
};
