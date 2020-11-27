import { Document, model, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const Post = new Schema(
  {
    title: String,
    content: String,
    writer: Schema.Types.ObjectId,
    category: String,
    comment: [Schema.Types.ObjectId],
    timestamp: { type: Date, default: Date.now() },
  },
  {
    versionKey: false,
  },
);

Post.index({ title: 'text', content: 'text' }, { defaultLanguage: 'kr' });
Post.plugin(mongoosePaginate);

const Model = model('Post', Post);
Model.createIndexes();

export default Model;

export interface IPost extends Document {
  title?: string;
  content?: string;
  writer?: Schema.Types.ObjectId;
  category?: 'Free' | 'Humor' | 'Illustration' | 'Recruitment';
  comment?: Schema.Types.ObjectId[];
  timestamp?: Date;
}
