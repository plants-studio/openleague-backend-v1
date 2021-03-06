import { Request, Response } from 'express';
import { readFileSync, unlinkSync } from 'fs';
import { PaginateResult } from 'mongoose';
import { join } from 'path';
import sharp from 'sharp';

import games from '../docs/games.json';
import { IRequest, IToken } from '../middleware/auth';
import League, { ILeague } from '../models/League';

const flat = (arr: Array<any>, d = 1): Array<any> => (d > 0
  ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flat(val, d - 1) : val), [])
  : arr.slice());

const hex = (str: string) => {
  let result = '';
  for (let i = 0; i < str.length; i += 1) {
    result += str.charCodeAt(i);
  }
  return Number.parseInt(result, 10);
};

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
  if (title.length <= 3 || title.length >= 50) {
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
      let g: string;
      switch (game) {
        case 'League Of Legend':
          g = 'lol';
          break;
        case 'Overwatch':
          g = 'overwatch';
          break;
        case 'Valorant':
          g = 'valorant';
          break;
        case 'Battlegrounds':
          g = 'pubg';
          break;
        case 'Rainbow Six Siege':
          g = 'rainbowsix';
          break;
        default:
          g = 'etc';
          break;
      }
      if (search) {
        const result1: PaginateResult<ILeague> = await League.paginate(
          { game, $text: { $search: search as string } },
          { page, limit },
        );
        const result2 = await Promise.all(
          result1.docs.map(async (data) => {
            const temp = data;
            const number = (hex(data._id.toString()) % 3) + 1;
            if (temp.thumbnail) {
              const id = temp._id.toString('base64');
              const dir = join(__dirname, '..', 'public', 'images', 'thumbnails');
              try {
                readFileSync(join(dir, `pre_${id}.webp`));
                temp.thumbnail = `/images/thumbnails/pre_${id}.webp`;
              } catch {
                const buffer = temp.thumbnail.split(';base64,')[1];
                try {
                  await sharp(Buffer.from(buffer, 'base64'))
                    .resize(712, 400)
                    .webp({ lossless: false, quality: 80 })
                    .toFile(join(dir, `pre_${id}.webp`));
                  temp.thumbnail = `/images/thumbnails/pre_${id}.webp`;
                } catch (err) {
                  console.error(err);
                  temp.thumbnail = `/images/thumbnails/${g}/pre_default${number}.webp`;
                }
              }
            } else {
              temp.thumbnail = `/images/thumbnails/${g}/pre_default${number}.webp`;
            }
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
        result1.docs.map(async (data) => {
          const temp = data;
          const number = (hex(data._id.toString()) % 3) + 1;
          if (temp.thumbnail) {
            const id = temp._id.toString('base64');
            const dir = join(__dirname, '..', 'public', 'images', 'thumbnails');
            try {
              readFileSync(join(dir, `pre_${id}.webp`));
              temp.thumbnail = `/images/thumbnails/pre_${id}.webp`;
            } catch {
              const buffer = temp.thumbnail.split(';base64,')[1];
              try {
                await sharp(Buffer.from(buffer, 'base64'))
                  .resize(712, 400)
                  .webp({ lossless: false, quality: 80 })
                  .toFile(join(dir, `pre_${id}.webp`));
                temp.thumbnail = `/images/thumbnails/pre_${id}.webp`;
              } catch (err) {
                console.error(err);
                temp.thumbnail = `/images/thumbnails/${g}/pre_default${number}.webp`;
              }
            }
          } else {
            temp.thumbnail = `/images/thumbnails/${g}/pre_default${number}.webp`;
          }
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

  res
    .status(200)
    .send(
      flat(result, Infinity).sort(
        (a: ILeague, b: ILeague) => b.timestamp!.getMilliseconds() - a.timestamp!.getMilliseconds(),
      ),
    );
};

export const edit = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { id } = req.params;
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
    status,
  }: ILeague = req.body;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const league: ILeague = await League.findById(id);
  if (!league) {
    res.sendStatus(404);
    return;
  }

  if (league.host!.toString() !== token?.user?._id) {
    console.log(league.host, token?.user?._id);
    res.sendStatus(403);
    return;
  }
  if (teamMax && league.teams?.length! > teamMax) {
    res.sendStatus(409);
    return;
  }

  if (title) {
    await league.updateOne({ title });
  }
  if (applicationDeadline) {
    await league.updateOne({ leagueStartDay });
  }
  if (leagueEndDay) {
    await league.updateOne({ leagueEndDay });
  }
  if (introduce) {
    await league.updateOne({ introduce });
  }
  if (rule) {
    await league.updateOne({ rule });
  }
  if (thumbnail) {
    await league.updateOne({ thumbnail });
    const base64Id = league._id.toString('base64');
    const dir = join(__dirname, '..', 'public', 'images', 'thumbnails');
    try {
      readFileSync(join(dir, `${base64Id}.webp`));
      unlinkSync(join(dir, `${base64Id}.webp`));
      const buffer = thumbnail.split(';base64,')[1];
      try {
        await sharp(Buffer.from(buffer, 'base64'))
          .resize(356, 200)
          .webp({ lossless: false, quality: 80 })
          .toFile(join(dir, `pre_${base64Id}.webp`));
        await sharp(Buffer.from(buffer, 'base64'))
          .resize(1920, 1080)
          .webp({ lossless: false })
          .toFile(join(dir, `${base64Id}.webp`));
      } catch (err) {
        console.error(err);
      }
    } catch (err) {
      console.error(err);
    }
  }
  if (game) {
    await league.updateOne({ league });
  }
  if (teamMin) {
    await league.updateOne({ teamMin });
  }
  if (teamMax) {
    await league.updateOne({ teamMax });
  }
  if (teamReqMemCnt) {
    await league.updateOne({ teamReqMemCnt });
  }
  if (placeType) {
    await league.updateOne({ placeType });
  }
  if (discordLink) {
    await league.updateOne({ discordLink });
  }
  if (location) {
    await league.updateOne({ location });
  }
  if (status) {
    await league.updateOne({ status });
  }
  res.sendStatus(200);
};

export const read = async (req: Request, res: Response) => {
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
  let g: string;
  switch (league.game) {
    case 'League Of Legend':
      g = 'lol';
      break;
    case 'Overwatch':
      g = 'overwatch';
      break;
    case 'Valorant':
      g = 'valorant';
      break;
    case 'Battleground':
      g = 'pubg';
      break;
    case 'Rainbow Six Siege':
      g = 'rainbowsix';
      break;
    default:
      g = 'etc';
      break;
  }
  const number = (hex(league._id.toString()) % 3) + 1;

  if (league.thumbnail) {
    const tempId = league._id.toString('base64');
    const dir = join(__dirname, '..', 'public', 'images', 'thumbnails');
    try {
      readFileSync(join(dir, `${tempId}.webp`));
      league.thumbnail = `/images/thumbnails/${tempId}.webp`;
    } catch {
      const buffer = league.thumbnail.split(';base64,')[1];
      try {
        await sharp(Buffer.from(buffer, 'base64'))
          .resize(1920, 1080)
          .webp({ lossless: false })
          .toFile(join(dir, `${tempId}.webp`));
        league.thumbnail = `/images/thumbnails/${tempId}.webp`;
      } catch (err) {
        console.error(err);
        league.thumbnail = `/images/thumbnails/${g}/default${number}.webp`;
      }
    }
  } else {
    league.thumbnail = `/images/thumbnails/${g}/default${number}.webp`;
  }

  res.status(200).send(league);
};

export const apply = async (req: IRequest, res: Response) => {
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

  await league.updateOne({ $push: { members: token?.user?._id } });
  res.sendStatus(200);
};

export const members = async (req: Request, res: Response) => {
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

  res.status(200).send(league.members);
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

  if (league.host!.toString() !== token?.user?._id) {
    res.sendStatus(403);
    return;
  }

  await league.deleteOne();
  res.sendStatus(200);
};
