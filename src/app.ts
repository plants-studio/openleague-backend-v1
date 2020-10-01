import cookieParser from 'cookie-parser';
import { config } from 'dotenv-safe';
import express, { json, urlencoded } from 'express';
import { connect } from 'mongoose';
import morgan from 'morgan';
import swagger from 'swagger-ui-express';

import document from './docs/swagger.json';
import router from './routes/index';

const app = express();

app.use(morgan('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', router);
app.use('/api-docs', swagger.serve);
app.get('/api-docs', swagger.setup(document));

config();

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
