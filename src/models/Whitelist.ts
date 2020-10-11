import { Document, model, Schema } from 'mongoose';

const Whitelist = new Schema({
  token: String,
  timestamp: { type: Date, default: Date.now() },
});

export default model('Whitelist', Whitelist);

export interface IWhitelist extends Document {
  token: string;
  timestamp: Date;
}
