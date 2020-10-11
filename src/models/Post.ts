import { Document, model, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// TODO 유저 - 친구 관계처럼 글 - 댓글 관계 생성
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
