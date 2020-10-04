import { Document, model, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const League = new Schema({
  title: String,
  content: String,
  host: String,
  game: String,
  max: Number,
  member: [String],
  reward: String,
});

League.plugin(mongoosePaginate);

export default model('League', League);

export interface ILeague extends Document {
  title?: string;
  content?: string;
  host?: string;
  game?: string;
  max?: number;
  member?: [string];
  reward?: string;
}
