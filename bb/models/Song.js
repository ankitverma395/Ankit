import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  youtubeId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  artist: { type: String, required: true },
  thumbnail: { type: String },
  duration: { type: String },
  playCount: { type: Number, default: 0 },
  totalListeningTime: { type: Number, default: 0 }
});

export default mongoose.model('Song', songSchema);