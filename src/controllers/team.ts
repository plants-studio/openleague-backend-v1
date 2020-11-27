import { Request, Response } from 'express';

import { IRequest, IToken } from '../middleware/auth';
import Team, { ITeam } from '../models/Team';
import User, { IUser } from '../models/User';

export const accept = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { id } = req.params;
  const { userId } = req.body;
  if (!(id && userId)) {
    res.sendStatus(412);
    return;
  }

  const team: ITeam = await Team.findById(id);
  if (!team) {
    res.status(404).send('팀이 존재하지 않습니다.');
  }

  const user: IUser = await User.findById(userId);
  if (!user) {
    res.status(404).send('유저가 존재하지 않습니다.');
    return;
  }

  if (token?.user?._id !== team.leader) {
    res.sendStatus(403);
    return;
  }

  if (team.member?.find((data) => data.toString() === user._id.toString())) {
    res.status(409).send('유저가 이미 팀에 속해있습니다.');
    return;
  }

  if (!team.waiting?.find((data) => data.toString() === user._id.toString())) {
    res.status(409).send('유저가 가입 신청을 넣지 않았습니다.');
    return;
  }

  await team.updateOne({ $push: { member: user._id } });
  await team.updateOne({ $pull: { waiting: user._id } });
  res.sendStatus(200);
};
export const create = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { name, introduce, isPublic }: ITeam = req.body;
  if (!(name && introduce && isPublic)) {
    res.sendStatus(412);
    return;
  }

  const newTeam: ITeam = new Team({
    name,
    introduce,
    leader: token?.user?._id,
    isPublic,
  });

  await newTeam.save();
  res.sendStatus(200);
};
export const join = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const team: ITeam = await Team.findById(id);
  if (!team) {
    res.sendStatus(404);
    return;
  }

  await team.updateOne({ $push: { waiting: token?.user?._id } });
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
  const result = await Team.paginate({ isPublic: true }, { page, limit });
  res.status(200).send(result);
};
export const remove = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const team: ITeam = await Team.findById(id);
  if (!team) {
    res.sendStatus(404);
    return;
  }

  if (team.leader !== token?.user?._id) {
    res.sendStatus(403);
    return;
  }

  await team.deleteOne();
  res.sendStatus(200);
};
export const waiting = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const team: ITeam = await Team.findById(id);
  if (!team) {
    res.sendStatus(404);
    return;
  }

  if (
    team.member?.find((data) => data.toString() === token?.user?._id.toString())
    || team.leader !== token?.user?._id
  ) {
    res.sendStatus(403);
  }

  res.status(200).send(team.waiting);
};
