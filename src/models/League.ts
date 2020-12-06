import { Document, model, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const League = new Schema(
  {
    title: String,
    applicationDeadline: String,
    leagueStartDay: String,
    leagueEndDay: String,
    introduce: String,
    rule: String,
    thumbnail: String,
    game: String,
    teamMin: Number,
    teamMax: Number,
    teamReqMemCnt: Number,
    placeType: String,
    discordLink: String,
    location: String,
    applicant: { type: Number, default: 0 },
    host: Schema.Types.ObjectId,
    teams: [Schema.Types.ObjectId],
    status: { type: String, default: 'RECRUIT' },
    timestamp: { type: Date, default: Date.now() },
  },
  {
    versionKey: false,
  },
);

League.index({ title: 'text', introduce: 'text' }, { defaultLanguage: 'kr' });
League.plugin(mongoosePaginate);

const Model = model('League', League);
Model.createIndexes();

export default Model;

export interface ILeague extends Document {
  title?: string;
  applicationDeadline?: string;
  leagueStartDay?: string;
  leagueEndDay?: string;
  introduce?: string;
  rule?: string;
  thumbnail?: string;
  game?:
    | 'League Of Legend'
    | 'Overwatch'
    | 'Valorant'
    | 'Battleground'
    | 'Rainbow Six Siege'
    | 'Etc';
  teamMin?: number;
  teamMax?: number;
  teamReqMemCnt?: number;
  placeType?: string;
  discordLink?: string;
  location?: string;
  applicant?: number;
  host?: Schema.Types.ObjectId;
  teams?: Schema.Types.ObjectId[];
  status: 'RECRUIT' | 'FULLED' | 'RECRUIT_DONE' | 'INPROGRESS' | 'COMPLETE' | 'CANCLED';
  timestamp?: Date;
}
