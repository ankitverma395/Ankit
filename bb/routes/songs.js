import express from 'express';
import Song from '../models/Song.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

router.post('/', async (req, res) => {
  try {
    const { youtubeId, title, artist, thumbnail, duration } = req.body;
    let song = await Song.findOne({ youtubeId });
    if (!song) {
      song = new Song({ youtubeId, title, artist, thumbnail, duration });
      await song.save();
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;