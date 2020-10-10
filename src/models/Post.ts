import { Document, model, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const Post = new Schema(
  {
    title: String,
    content: String,
    writer: Schema.Types.ObjectId,
    category: String,
    timestamp: { type: Date, default: Date.now() },
  },
  {
    versionKey: false,
  },
);

Post.plugin(mongoosePaginate);

export default model('Post', Post);

export interface IPost extends Document {
  title?: string;
  content?: string;
  writer?: Schema.Types.ObjectId;
  category?: string;
  timestamp?: Date;
}
