import { pbkdf2Sync, randomBytes } from 'crypto';
import DiscordOAuth2 from 'discord-oauth2';
import { Request, Response } from 'express';
import { readFileSync, unlinkSync } from 'fs';
import { sign, verify } from 'jsonwebtoken';
import { join } from 'path';
import sharp from 'sharp';

import { IRequest, IToken } from '../middleware/auth';
import Friend, { IFriend } from '../models/Friend';
import User, { IUser } from '../models/User';
import Whitelist, { IWhitelist } from '../models/Whitelist';

const hex = (str: string) => {
  let result = '';
  for (let i = 0; i < str.length; i += 1) {
    result += str.charCodeAt(i);
  }
  return Number.parseInt(result, 10);
};

export const getData = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.sendStatus(412);
    return;
  }

  const user: IUser = await User.findById(id);
  if (!user) {
    res.sendStatus(404);
    return;
  }

  user.password = undefined;

  res.status(200).send(user);
};

export const discord = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    res.sendStatus(412);
    return;
  }
  const oauth = new DiscordOAuth2();
  const user = await oauth.getUser(token);
  if (!user.verified) {
    res.sendStatus(401);
    return;
  }

  let data;

  const userData: IUser = await User.findOne({ discord: user.id });
  if (!userData) {
    const nameTag = `${user.username}#${user.discriminator}`;
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

    data = {
      email: user.email,
      name: nameTag,
      friend: newFriend._id,
      // TODO 디스코드 avatar base64 형태로 들고와서 DB에 저장하고 static에 저장
    };
  } else {
    data = {
      email: userData.email,
      name: userData.name,
      profile: userData.profile,
      friend: userData.friend,
    };
  }
  res.status(200).send(data);
};

export const edit = async (req: IRequest, res: Response) => {
  const { token }: IToken = req;
  const { name, profile } = req.body;

  const user: IUser = await User.findById(token?.user?._id);
  if (name) {
    if (name.search('#') !== -1) {
      res.status(409);
      return;
    }

    let nameTag;
    let nameCheck = true;
    while (nameCheck) {
      const tag = (Math.floor(Math.random() * 90000) + 10000).toString();
      nameTag = `${name}#${tag}`;
      nameCheck = await User.findOne({ name: nameTag });
    }
    await user.updateOne({ name: nameTag });
  }
  if (profile) {
    await user.updateOne({ profile });
    const id = token?.user?._id.toString('base64');
    const dir = join(__dirname, '..', 'public', 'images', 'profiles');
    try {
      readFileSync(join(dir, `${id}.webp`));
      unlinkSync(join(dir, `${id}.webp`));
      const buffer = profile.split(';base64,')[1];
      try {
        await sharp(Buffer.from(buffer, 'base64'))
          .resize(150, 150)
          .webp({ lossless: false })
          .toFile(join(dir, `${id}.webp`));
      } catch (err) {
        console.error(err);
      }
    } catch (err) {
      console.error(err);
    }
  }
  res.sendStatus(200);
};

export const refresh = async (req: Request, res: Response) => {
  try {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      const refreshToken = req.headers.authorization.substring(7);
      if (refreshToken.split('.').length !== 3) {
        const oauth = new DiscordOAuth2();
        const token = await oauth.tokenRequest({
          scope: 'identify',
          grantType: 'refresh_token',
          refreshToken,
          redirectUri: process.env.REDIRECT_URI,
          clientId: process.env.DISCORD_ID,
          clientSecret: process.env.DISCORD_SECRET,
        });
        res.status(200).send(token);
      } else {
        const whitelist = await Whitelist.findOne({ token: refreshToken });
        if (!whitelist) {
          res.sendStatus(401);
          return;
        }
        const verified = JSON.parse(JSON.stringify(verify(refreshToken, process.env.REFRESH_KEY!)));
        const accessToken = sign({ user: verified.user }, process.env.ACCESS_KEY!, {
          expiresIn: '7h',
        });
        const newRefreshToken = sign({ user: verified.user }, process.env.REFRESH_KEY!, {
          expiresIn: '7d',
        });

        const whiteAccess: IWhitelist = new Whitelist({
          token: accessToken,
        });
        const whiteRefresh: IWhitelist = new Whitelist({
          token: newRefreshToken,
        });
        const token = {
          accessToken,
          refreshToken: newRefreshToken,
        };

        await whiteAccess.save();
        await whiteRefresh.save();
        res.status(200).send(token);
      }
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(401);
  }
};

export const revoke = async (req: Request, res: Response) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    const token = req.headers.authorization.substring(7);
    if (token.split('.').length === 3) {
      await Whitelist.findOneAndDelete({ token });
      res.sendStatus(200);
    } else {
      const oauth = new DiscordOAuth2();
      oauth.revokeToken(
        token,
        Buffer.from(`${process.env.DISCORD_ID}:${process.env.DISCORD_SECRET}`).toString('base64'),
      );
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(401);
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password }: IUser = req.body;
  if (!(email && password)) {
    res.sendStatus(412);
    return;
  }

  const user: IUser = await User.findOne({ email });
  if (!user) {
    res.sendStatus(404);
    return;
  }

  const temp = user.password?.split('|');
  if (!temp) {
    res.sendStatus(500);
    return;
  }

  const encrypt = pbkdf2Sync(password, temp[1], 100000, 64, 'SHA512').toString('base64');
  if (encrypt !== temp[0]) {
    res.sendStatus(401);
    return;
  }

  user.password = undefined;

  const number = (hex(user._id.toString()) % 10) + 1;
  if (user.profile) {
    const id = user._id.toString('base64');
    const dir = join(__dirname, '..', 'public', 'images', 'profiles');
    try {
      readFileSync(join(dir, `${id}.webp`));
      user.profile = `/images/profiles/${id}.webp`;
    } catch {
      const data = user.profile.split(';base64,')[1];
      try {
        await sharp(Buffer.from(data, 'base64'))
          .resize(150, 150)
          .webp({ lossless: false })
          .toFile(join(dir, `${id}.webp`));
        user.profile = `/images/profiles/${id}.webp`;
      } catch (err) {
        console.error(err);
        user.profile = `/images/profiles/default${number}.webp`;
      }
    }
  } else {
    user.profile = `/images/profiles/default${number}.webp`;
  }

  const accessToken = sign({ user }, process.env.ACCESS_KEY!, { expiresIn: '7h' });
  const refreshToken = sign({ user }, process.env.REFRESH_KEY!, { expiresIn: '7d' });
  const token = {
    accessToken,
    refreshToken,
  };

  const whiteAccess: IWhitelist = new Whitelist({
    token: accessToken,
  });
  const whiteRefresh: IWhitelist = new Whitelist({
    token: refreshToken,
  });

  await whiteAccess.save();
  await whiteRefresh.save();
  res.status(200).send(token);
};

export const signup = async (req: Request, res: Response) => {
  const {
    name, email, password, profile,
  }: IUser = req.body;
  if (!(name && email && password)) {
    res.sendStatus(412);
    return;
  }

  if (name.search('#') !== -1) {
    res.status(409).send('닉네임에는 #이 포함될 수 없습니다.');
    return;
  }

  let nameTag;
  let nameCheck = true;
  while (nameCheck) {
    const tag = (Math.floor(Math.random() * 90000) + 10000).toString();
    nameTag = `${name}#${tag}`;
    nameCheck = await User.findOne({ name: nameTag });
  }

  const emailCheck = await User.findOne({ email });
  if (emailCheck) {
    res.status(409).send('이미 같은 이메일이 존재합니다.');
    return;
  }

  const salt = randomBytes(16).toString('base64');
  const encrypt = pbkdf2Sync(password, salt, 100000, 64, 'SHA512').toString('base64');
  const newFriend: IFriend = new Friend();
  const newUser: IUser = new User({
    name: nameTag,
    email,
    password: `${encrypt}|${salt}`,
    friend: newFriend._id,
    profile,
  });

  await newUser.save();
  await newFriend.save();
  res.sendStatus(200);
};
