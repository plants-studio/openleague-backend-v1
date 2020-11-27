import { Document, model, Schema } from 'mongoose';

const Notification = new Schema(
  {
    title: Schema.Types.String,
    description: Schema.Types.String,
    category: Schema.Types.String,
  },
  {
    versionKey: false,
  },
);

export default model('Notification', Notification);

export interface INotification extends Document {
  title?: string;
  description?: string;
  category?: 'Comment' | 'Friend' | 'League' | 'Team' | 'ETC';
}
