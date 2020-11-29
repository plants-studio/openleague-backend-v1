import { Document, model, Schema } from 'mongoose';

const Friend = new Schema(
  {
    friends: [Schema.Types.ObjectId],
    applying: [Schema.Types.ObjectId],
    waiting: [Schema.Types.ObjectId],
  },
  {
    versionKey: false,
  },
);

export default model('Friend', Friend);

export interface IFriend extends Document {
  friends?: Schema.Types.ObjectId[];
  applying?: Schema.Types.ObjectId[];
  waiting?: Schema.Types.ObjectId[];
}
