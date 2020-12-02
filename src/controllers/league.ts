import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { PaginateResult } from 'mongoose';
import { join } from 'path';
import sharp from 'sharp';

import games from '../docs/games.json';
import { IRequest, IToken } from '../middleware/auth';
import League, { ILeague } from '../models/League';

const flat = (arr: Array<any>, d = 1): Array<any> => (d > 0
  ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flat(val, d - 1) : val), [])
  : arr.slice());

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
  const random = Math.floor(Math.random() * 3 + 1);
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
            if (temp.thumbnail) {
              const id = temp._id.toString('base64');
              const dir = join(__dirname, '..', 'public', 'images', 'thumbnails');
              try {
                readFileSync(join(dir, `${id}.webp`));
                temp.thumbnail = `/images/thumbnails/${id}.webp`;
              } catch {
                const buffer = temp.thumbnail.split(';base64,')[1];
                try {
                  await sharp(Buffer.from(buffer, 'base64'))
                    .webp({ lossless: true })
                    .toFile(join(dir, `${id}.webp`));
                  temp.thumbnail = `/images/thumbnails/${id}.webp`;
                } catch (err) {
                  console.error(err);
                  temp.thumbnail = `/images/thumbnails/${g}/default${random}.webp`;
                }
              }
            } else {
              temp.thumbnail = `/images/thumbnails/${g}/default${random}.webp`;
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
          if (temp.thumbnail) {
            const id = temp._id.toString('base64');
            const dir = join(__dirname, '..', 'public', 'images', 'thumbnails');
            try {
              readFileSync(join(dir, `${id}.webp`));
              temp.thumbnail = `/images/thumbnails/${id}.webp`;
            } catch {
              const buffer = temp.thumbnail.split(';base64,')[1];
              try {
                await sharp(Buffer.from(buffer, 'base64'))
                  .webp({ lossless: true })
                  .toFile(join(dir, `${id}.webp`));
                temp.thumbnail = `/images/thumbnails/${id}.webp`;
              } catch (err) {
                console.error(err);
                temp.thumbnail = `/images/thumbnails/${g}/default${random}.webp`;
              }
            }
          } else {
            temp.thumbnail = `/images/thumbnails/${g}/default${random}.webp`;
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
  res.status(200).send(flat(result));
};

export const read = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const league = await League.findById(id);
  if (!league) {
    res.sendStatus(404);
    return;
  }

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
          .webp({ lossless: true })
          .toFile(join(dir, `${tempId}.webp`));
        league.thumbnail = `/images/thumbnails/${tempId}.webp`;
      } catch (err) {
        console.error(err);
        league.thumbnail = '/images/thumbnails/default.webp';
      }
    }
  } else {
    league.thumbnail = '/images/thumbnails/default.webp';
  }

  res.status(200).send(league);
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
