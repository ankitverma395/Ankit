import express from 'express';
import Comment from '../models/Comment.js';
import Song from '../models/Song.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/song/:songId', async (req, res) => {
  try {
    // First find the Song document by youtubeId or _id
    let song = await Song.findOne({ youtubeId: req.params.songId });
    if (!song && req.params.songId.match(/^[0-9a-fA-F]{24}$/)) {
      song = await Song.findById(req.params.songId);
    }
    if (!song) return res.json([]);
    
    const comments = await Comment.find({ song: song._id })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { songId, text } = req.body;
    let song = await Song.findOne({ youtubeId: songId });
    if (!song && songId.match(/^[0-9a-fA-F]{24}$/)) {
      song = await Song.findById(songId);
    }
    if (!song) return res.status(404).json({ message: 'Song not found' });
    
    const comment = new Comment({
      song: song._id,
      user: req.user.userId,
      text
    });
    await comment.save();
    await comment.populate('user', 'username profilePicture');
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;