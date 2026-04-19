import mongoose from 'mongoose';
import crypto from 'crypto';

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  coverImage: { type: String },
  isPublic: { type: Boolean, default: true },
  shareToken: { type: String, unique: true, default: () => crypto.randomBytes(16).toString('hex') },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Playlist', playlistSchema);