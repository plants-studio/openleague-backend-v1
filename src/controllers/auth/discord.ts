import DiscordOauth2 from 'discord-oauth2';
import { Request, Response } from 'express';

import Friend, { IFriend } from '../../models/Friend';
import User, { IUser } from '../../models/User';

export default async (req: Request, res: Response) => {
  const { discord } = req.body;
  if (!discord) {
    res.sendStatus(412);
    return;
  }
  const oauth = new DiscordOauth2();
  const user = await oauth.getUser(discord);
  if (!user.verified) {
    res.sendStatus(401);
    return;
  }

  const nameTag = `${user.username}#${user.discriminator}`;

  const data = {
    email: user.email,
    name: nameTag,
  };

  const userData = await User.findOne({ discord: user.id });
  if (!userData) {
    const newFriend: IFriend = new Friend();
    const newUser: IUser = new User({
      email: user.email,
      name: nameTag,
      discord: user.id,
      friend: newFriend._id,
    });

    const emailCheck = await User.findOne({ email: user.email });
    if (emailCheck) {
      res.sendStatus(409);
      return;
    }

    await newUser.save();
    await newFriend.save();
  }
  res.status(200).send(data);
};
