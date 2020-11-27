import { Document, model, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const Team = new Schema(
  {
    name: String,
    introduce: String,
    leader: Schema.Types.ObjectId,
    member: [Schema.Types.ObjectId],
    waiting: [Schema.Types.ObjectId],
  },
  {
    versionKey: false,
  },
);

Team.index({ name: 'text' }, { defaultLanguage: 'kr' });
Team.plugin(mongoosePaginate);

const Model = model('Team', Team);
Model.createIndexes();

export default Model;

export interface ITeam extends Document {
  name?: string;
  introduce?: string;
  leader?: Schema.Types.ObjectId;
  member?: Schema.Types.ObjectId[];
  waiting?: Schema.Types.ObjectId[];
}
