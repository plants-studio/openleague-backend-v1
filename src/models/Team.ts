import { Document, model, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const Team = new Schema(
  {
    name: String,
    introduce: String,
    leader: Schema.Types.ObjectId,
    member: [Schema.Types.ObjectId],
    isPublic: Boolean,
    waiting: [Schema.Types.ObjectId],
  },
  {
    versionKey: false,
  },
);

Team.plugin(mongoosePaginate);

export default model('Team', Team);

export interface ITeam extends Document {
  name?: string;
  introduce?: string;
  leader?: Schema.Types.ObjectId;
  member?: Schema.Types.ObjectId[];
  isPublic?: boolean;
  waiting?: Schema.Types.ObjectId[];
}
