// import mongoose from 'mongoose';

// const listeningHistorySchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
//   listenedAt: { type: Date, default: Date.now },
//   durationListened: { type: Number, default: 0 }
// });

// export default mongoose.model('ListeningHistory', listeningHistorySchema);

// backend/models/ListeningHistory.js
import mongoose from 'mongoose';

const listeningHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
  listenedAt: { type: Date, default: Date.now },
  date: { type: String, required: true }, // YYYY-MM-DD
  durationListened: { type: Number, default: 0 }
});

// Pre-save middleware to set date field
listeningHistorySchema.pre('save', function(next) {
  if (!this.date) {
    this.date = new Date().toISOString().split('T')[0];
  }
  next();
});

export default mongoose.model('ListeningHistory', listeningHistorySchema);