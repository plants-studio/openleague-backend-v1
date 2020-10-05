import { Document, model, Schema } from 'mongoose';

const User = new Schema({
  name: String,
  email: String,
  password: String,
});

export default model('User', User);

export interface IUser extends Document {
  name?: string;
  email?: string;
  password?: string;
}
