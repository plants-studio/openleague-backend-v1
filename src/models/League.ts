import { Document, model, Schema } from 'mongoose';

const League = new Schema({
  host: String,
  game: String,
  max: Number,
  member: [String],
  reward: String,
});

export default model('League', League);

export interface ILeague extends Document {
  host?: string;
  game?: string;
  max?: number;
  member?: [string];
  reward?: string;
}
