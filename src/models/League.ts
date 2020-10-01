import { Document, model, Schema } from 'mongoose';

const League = new Schema({
  host: String,
  game: String,
  headcount: Number,
  current: Number,
  reward: String,
});

export default model('League', League);

export interface ILeague extends Document {
  host?: string;
  game?: string;
  headcount?: number;
  current?: number;
  reward?: string;
}
