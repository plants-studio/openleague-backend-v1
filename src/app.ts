import 'dotenv-safe/config';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import { CronJob } from 'cron';
import express, { json, static as _static, urlencoded } from 'express';
import { verify } from 'jsonwebtoken';
import { connect, set } from 'mongoose';
import morgan from 'morgan';
import swagger from 'swagger-ui-express';

import document from './docs/swagger.json';
import Whitelist, { IWhitelist } from './models/Whitelist';
import router from './routes/index';

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(json({ limit: '3mb' }));
app.use(urlencoded({ limit: '3mb', extended: false }));
app.use(morgan('dev'));

app.use('/', router);
app.use('/api-docs', swagger.serve, swagger.setup(document));
app.use('/static', _static(`${__dirname}/public`));
app.get('/callback', (_req, res) => {
  res.sendStatus(200);
});

const job = new CronJob('0 0 * * 0', async () => {
  const whitelist: Array<IWhitelist> = await Whitelist.find();
  whitelist.forEach(async (data, i) => {
    try {
      verify(data.token, process.env.ACCESS_KEY!);
      try {
        verify(data.token, process.env.REFRESH_KEY!);
      } catch {
        whitelist[i].deleteOne();
      }
    } catch {
      whitelist[i].deleteOne();
    }
  });
});

job.start();

set('useCreateIndex', true);
connect(
  process.env.DB_URI!,
  {
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      throw err;
    }

    console.log('db connected');
  },
);

export default app;
