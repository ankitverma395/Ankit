import express from 'express';
import Playlist from '../models/Playlist.js';
import Song from '../models/Song.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all playlists for current user
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.userId }).populate('songs');
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single playlist by ID
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    }).populate('songs');
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new playlist
router.post('/', async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const playlist = new Playlist({
      name,
      description: description || '',
      user: req.user.userId,
      isPublic: isPublic !== undefined ? isPublic : true,
    });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add song to playlist
router.post('/:playlistId/songs', async (req, res) => {
  try {
    const { song } = req.body;
    if (!song || !song.youtubeId) {
      return res.status(400).json({ message: 'Song data required' });
    }

    // Find or create song in database
    let existingSong = await Song.findOne({ youtubeId: song.youtubeId });
    if (!existingSong) {
      existingSong = new Song({
        youtubeId: song.youtubeId,
        title: song.title,
        artist: song.artist,
        thumbnail: song.thumbnail,
        duration: song.duration || '',
      });
      await existingSong.save();
    }

    // Find playlist and add song
    const playlist = await Playlist.findOne({ 
      _id: req.params.playlistId, 
      user: req.user.userId 
    });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    if (!playlist.songs.includes(existingSong._id)) {
      playlist.songs.push(existingSong._id);
      await playlist.save();
    }

    await playlist.populate('songs');
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove song from playlist
router.delete('/:playlistId/songs/:songId', async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ 
      _id: req.params.playlistId, 
      user: req.user.userId 
    });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    playlist.songs = playlist.songs.filter(id => id.toString() !== req.params.songId);
    await playlist.save();
    await playlist.populate('songs');
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete playlist
router.delete('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.userId 
    });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get shared playlist (public)
router.get('/shared/:token', async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ 
      shareToken: req.params.token, 
      isPublic: true 
    }).populate('songs');
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;