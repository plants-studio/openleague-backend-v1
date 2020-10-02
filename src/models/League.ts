import { Document, model, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const League = new Schema({
  host: String,
  game: String,
  max: Number,
  member: [String],
  reward: String,
});

League.plugin(mongoosePaginate);

export default model('League', League);

export interface ILeague extends Document {
  host?: string;
  game?: string;
  max?: number;
  member?: [string];
  reward?: string;
}
