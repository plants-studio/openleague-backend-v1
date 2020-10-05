import { Document, model, Schema } from 'mongoose';

const Friends = new Schema({
  user: Schema.Types.ObjectId,
  friends: [Schema.Types.ObjectId],
  applying: [Schema.Types.ObjectId],
  waiting: [Schema.Types.ObjectId],
});

export default model('Friends', Friends);

export interface IFriends extends Document {
  user?: Schema.Types.ObjectId;
  friends?: [Schema.Types.ObjectId];
  applying?: [Schema.Types.ObjectId];
  waiting?: [Schema.Types.ObjectId];
}
