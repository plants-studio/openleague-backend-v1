import { Document, model, Schema } from 'mongoose';

const Friends = new Schema({
  user: String,
  friends: [String],
  applying: [String],
  waiting: [String],
});

export default model('Friends', Friends);

export interface IFriends extends Document {
  user?: string;
  friends?: [string];
  applying?: [string];
  waiting?: [string];
}
