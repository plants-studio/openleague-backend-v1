import { Document, model, Schema } from 'mongoose';

// TODO Friend 안에 User가 아닌 User 안에 Friend가 되도록 수정
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
