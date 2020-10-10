import { Document, model, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const League = new Schema(
  {
    title: String,
    content: String,
    fee: Number,
    host: Schema.Types.ObjectId,
    game: String,
    teams: [Schema.Types.ObjectId],
    teamMin: Number,
    teamMax: Number,
    teamReqMemCnt: Number,
    reward: String,
  },
  {
    versionKey: false,
  },
);

League.plugin(mongoosePaginate);

export default model('League', League);

export interface ILeague extends Document {
  title?: string;
  content?: string;
  fee?: number;
  host?: Schema.Types.ObjectId;
  game?: string;
  teams?: [Schema.Types.ObjectId];
  teamMin?: number;
  teamMax?: number;
  teamReqMemCnt?: number;
  reward?: string;
}
