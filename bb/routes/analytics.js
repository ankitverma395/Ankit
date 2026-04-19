// import mongoose from 'mongoose';
// import express from 'express';
// import ListeningHistory from '../models/ListeningHistory.js';
// import Song from '../models/Song.js';
// import { authenticateToken } from '../middleware/auth.js';

// const router = express.Router();
// router.use(authenticateToken);

// router.post('/track', async (req, res) => {
//   try {
//     const { songId, durationListened } = req.body;
//     if (!songId || durationListened === undefined) {
//       return res.status(400).json({ message: 'Missing songId or durationListened' });
//     }

//     // Ensure ObjectId
//     const songObjectId = new mongoose.Types.ObjectId(songId);
//     const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

//     const history = new ListeningHistory({
//       user: userObjectId,
//       song: songObjectId,
//       durationListened: Math.floor(durationListened)
//     });
//     await history.save();
//     // console.log('✅ Saved listening history:', history);

//     // Update song stats
//     await Song.findByIdAndUpdate(songObjectId, {
//       $inc: { playCount: 1, totalListeningTime: Math.floor(durationListened) }
//     });

//     res.json({ message: 'Tracked' });
//   } catch (error) {
//     console.error('Tracking error:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// router.get('/stats', async (req, res) => {
//   try {
//     const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

//     // Total listening time
//     const totalListeningTime = await ListeningHistory.aggregate([
//       { $match: { user: userObjectId } },
//       { $group: { _id: null, total: { $sum: '$durationListened' } } }
//     ]);

//     // Most played songs
//     const mostPlayed = await ListeningHistory.aggregate([
//       { $match: { user: userObjectId } },
//       { $group: { _id: '$song', count: { $sum: 1 } } },
//       { $sort: { count: -1 } },
//       { $limit: 10 },
//       { $lookup: { from: 'songs', localField: '_id', foreignField: '_id', as: 'song' } }
//     ]);

//     const totalPlays = mostPlayed.reduce((sum, item) => sum + item.count, 0);
//     const uniqueSongs = mostPlayed.length;

//     // console.log('Stats result:', {
//     //   totalListeningTime: totalListeningTime[0]?.total || 0,
//     //   totalPlays,
//     //   uniqueSongs,
//     //   mostPlayedCount: mostPlayed.length
//     // });

//     res.json({
//       totalListeningTime: totalListeningTime[0]?.total || 0,
//       totalPlays,
//       uniqueSongs,
//       mostPlayed: mostPlayed.filter(item => item.song && item.song.length > 0)
//     });
//   } catch (error) {
//     console.error('Stats error:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// export default router;

// backend/routes/analytics.js
import express from 'express';
import mongoose from 'mongoose';
import ListeningHistory from '../models/ListeningHistory.js';
import Song from '../models/Song.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// Track listening time (called from frontend)
router.post('/track', async (req, res) => {
  try {
    const { songId, durationListened } = req.body;
    if (!songId || durationListened === undefined) {
      return res.status(400).json({ message: 'Missing songId or durationListened' });
    }

    // Ensure we don't track tiny durations (prevents rapid increments)
    if (durationListened < 3) {
      return res.json({ message: 'Ignored (duration too short)' });
    }

    const today = new Date().toISOString().split('T')[0];
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const songObjectId = new mongoose.Types.ObjectId(songId);

    // Check if we already tracked this song today (optional: prevent double track)
    const existing = await ListeningHistory.findOne({
      user: userObjectId,
      song: songObjectId,
      date: today
    });

    if (existing) {
      // Update existing record instead of creating new one
      existing.durationListened += Math.floor(durationListened);
      await existing.save();
    } else {
      const history = new ListeningHistory({
        user: userObjectId,
        song: songObjectId,
        durationListened: Math.floor(durationListened),
        date: today
      });
      await history.save();
    }

    // Update song stats
    await Song.findByIdAndUpdate(songObjectId, {
      $inc: { 
        playCount: 1, 
        totalListeningTime: Math.floor(durationListened) 
      }
    });

    res.json({ message: 'Tracked' });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get today's stats
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

    const todayHistory = await ListeningHistory.aggregate([
      { $match: { user: userObjectId, date: today } },
      { $group: { 
        _id: null, 
        totalTime: { $sum: '$durationListened' },
        totalPlays: { $sum: 1 },
        uniqueSongs: { $addToSet: '$song' }
      } }
    ]);

    res.json({
      totalListeningTime: todayHistory[0]?.totalTime || 0,
      totalPlays: todayHistory[0]?.totalPlays || 0,
      uniqueSongs: todayHistory[0]?.uniqueSongs?.length || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all-time stats (lifetime)
router.get('/stats', async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

    const totalListeningTime = await ListeningHistory.aggregate([
      { $match: { user: userObjectId } },
      { $group: { _id: null, total: { $sum: '$durationListened' } } }
    ]);

    const mostPlayed = await ListeningHistory.aggregate([
      { $match: { user: userObjectId } },
      { $group: { _id: '$song', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'songs', localField: '_id', foreignField: '_id', as: 'song' } }
    ]);

    const totalPlays = mostPlayed.reduce((sum, item) => sum + item.count, 0);
    const uniqueSongs = mostPlayed.length;

    res.json({
      totalListeningTime: totalListeningTime[0]?.total || 0,
      totalPlays,
      uniqueSongs,
      mostPlayed: mostPlayed.filter(item => item.song && item.song.length > 0)
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const recent = await ListeningHistory.find({ user: req.user.userId })
      .sort({ listenedAt: -1 })
      .limit(20)
      .populate('song');
    res.json(recent.map(h => h.song).filter(s => s));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get daily stats for last N days (for chart)
router.get('/daily', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const dailyStats = await ListeningHistory.aggregate([
      { $match: { user: userObjectId, date: { $gte: startDateStr } } },
      { $group: {
        _id: '$date',
        totalTime: { $sum: '$durationListened' },
        totalPlays: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);

    res.json(dailyStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;