import { Response } from 'express';

import { IRequest, IToken } from '../middleware/auth';
import League, { ILeague } from '../models/League';
import Notification, { INotification } from '../models/Notification';
import Team, { ITeam } from '../models/Team';
import User, { IUser } from '../models/User';

export const check = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const result: INotification[] = [];
  token?.user?.notification?.forEach(async (id) => {
    const notification: INotification = await Notification.findById(id);
    result.push(notification);
  });

  res.status(200).send(result);
};

export const send = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { title, description, category }: INotification = req.body;
  const { target, type } = req.body;
  if (!(title && description && category && type)) {
    res.sendStatus(412);
    return;
  }

  const notification: INotification = new Notification({
    title,
    description,
    category,
  });

  switch (type) {
    case 'unit':
      {
        const user: IUser = await User.findById(target);
        if (!user) {
          res.status(404).send('유저를 찾을 수 없습니다');
          return;
        }

        await notification.save();
        await user.updateOne({ $push: { notification: notification._id } });
        res.sendStatus(200);
      }
      break;
    case 'team':
      {
        const team: ITeam = await Team.findById(target);
        if (!team) {
          res.status(404).send('팀을 찾을 수 없습니다');
          return;
        }
        if (team.leader !== token?.user?._id) {
          res.sendStatus(403);
          return;
        }

        await notification.save();
        team.member?.forEach(async (id) => {
          const user: IUser = await User.findById(id);
          await user.updateOne({ $push: { notification: notification._id } });
        });
        res.sendStatus(200);
      }
      break;
    case 'league':
      {
        const league: ILeague = await League.findById(target);
        if (!league) {
          res.status(404).send('리그를 찾을 수 없습니다');
          return;
        }
        if (league.host !== token?.user?._id) {
          res.sendStatus(403);
          return;
        }

        await notification.save();
        league.teams?.forEach(async (teamId) => {
          const team: ITeam = await Team.findById(teamId);
          team.member?.forEach(async (userId) => {
            const user: IUser = await User.findById(userId);
            await user.updateOne({ $push: { notification: notification._id } });
          });
        });
        res.sendStatus(200);
      }
      break;
    case 'broad':
      {
        if (!token?.user?.admin) {
          res.sendStatus(403);
          return;
        }
        const users: IUser[] = await User.find();
        users.forEach(async (user) => {
          await user.updateOne({ $push: { notification: notification._id } });
        });
        res.sendStatus(200);
      }
      break;
    default:
      res.sendStatus(412);
      break;
  }
};
