import { Document, model, Schema } from 'mongoose';

const User = new Schema(
  {
    name: String,
    email: String,
    password: String,
    discord: String,
    friend: Schema.Types.ObjectId,
    admin: { type: Boolean, default: false },
  },
  {
    versionKey: false,
  },
);

export default model('User', User);

export interface IUser extends Document {
  name?: string;
  email?: string;
  password?: string;
  discord?: string;
  friend?: Schema.Types.ObjectId;
  admin?: boolean;
}
