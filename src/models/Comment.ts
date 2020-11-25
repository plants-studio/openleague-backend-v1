import { Document, model, Schema } from 'mongoose';

const Comment = new Schema(
  {
    comments: {
      writer: Schema.Types.ObjectId,
      content: String,
    },
    timestamp: { type: Date, default: Date.now() },
  },
  {
    versionKey: false,
  },
);

export default model('Comment', Comment);

export interface IComment extends Document {
  comments?: {
    writer: Schema.Types.ObjectId;
    content: string;
  };
  timestamp?: Date;
}
