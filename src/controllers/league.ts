import { Request, Response } from 'express';

import games from '../docs/games.json';
import { IRequest, IToken } from '../middleware/auth';
import League, { ILeague } from '../models/League';
import Team, { ITeam } from '../models/Team';

export const create = async (req: IRequest, res: Response) => {
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

  await newLeague.save();
  res.sendStatus(200);
};

export const list = async (req: Request, res: Response) => {
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
  const result = await Promise.all(
    filter.map(async (game) => {
      const pagination = await League.paginate({ game }, { page, limit });
      return pagination.docs;
    }),
  );
  res.status(200).send(result);
};

export const participate = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { id } = req.params;
  const { teamId } = req.body;
  if (!(id && teamId)) {
    res.sendStatus(412);
    return;
  }

  const team: ITeam = await Team.findById(teamId);
  if (!team) {
    res.status(404).send('팀이 존재하지 않습니다.');
    return;
  }

  const league: ILeague = await League.findById(id);
  if (!league) {
    res.status(404).send('리그가 존재하지 않습니다.');
    return;
  }

  if (token !== team.leader) {
    res.sendStatus(403);
    return;
  }

  if (league.teamMax === league.teams?.length) {
    res.status(409).send('리그에 참여할 자리가 없습니다.');
    return;
  }

  if (league.teams?.find((data) => data.toString() === team._id.toString())) {
    res.status(409).send('이미 리그에 참여 중입니다.');
    return;
  }

  await league.updateOne({ $push: { teams: team._id } });
  res.sendStatus(200);
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
