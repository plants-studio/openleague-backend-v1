import { Document, model, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const League = new Schema(
  {
    title: String,
    content: String,
    fee: Number,
    host: Schema.Types.ObjectId,
    game: String,
    teams: [Schema.Types.ObjectId],
    teamMin: Number,
    teamMax: Number,
    teamReqMemCnt: Number,
    reward: String,
  },
  {
    versionKey: false,
  },
);

League.index({ title: 'text', content: 'text' }, { defaultLanguage: 'kr' });
League.plugin(mongoosePaginate);

const Model = model('League', League);
Model.createIndexes();

export default Model;

export interface ILeague extends Document {
  title?: string;
  content?: string;
  fee?: number;
  host?: Schema.Types.ObjectId;
  game?:
    | 'League of Legends'
    | 'Overwatch'
    | 'Valorant'
    | 'Hearthstone'
    | 'Crazyracing Kartrider'
    | "Tom Clancy's Rainbow Six Siege"
    | 'StarCraft'
    | 'StarCraft II'
    | 'FIFA Online 4'
    | 'Civilization VI'
    | 'Tekken 7'
    | 'Sudden Attack'
    | 'Among Us'
    | 'Fall Guys'
    | 'Call of Duty'
    | 'Apex Legends'
    | 'Grand Theft Auto V'
    | 'Dota 2'
    | "PLAYERUNKNOWN'S BATTLEGROUNDS"
    | 'Fortnite'
    | 'ETC';
  teams?: Schema.Types.ObjectId[];
  teamMin?: number;
  teamMax?: number;
  teamReqMemCnt?: number;
  reward?: string;
}
