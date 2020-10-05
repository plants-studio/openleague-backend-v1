import { Document, model, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const League = new Schema({
  title: String,
  content: String,
  host: Schema.Types.ObjectId,
  game: String,
  max: Number,
  member: [Schema.Types.ObjectId],
  reward: String,
});

League.plugin(mongoosePaginate);

export default model('League', League);

export interface ILeague extends Document {
  title?: string;
  content?: string;
  host?: Schema.Types.ObjectId;
  game?: string;
  max?: number;
  member?: [Schema.Types.ObjectId];
  reward?: string;
}
