import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Song from '../models/Song.js'; // Required for populate
import { authenticateToken } from '../middleware/auth.js';
import { getIo } from '../socket.js';

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, username, email, createdAt: user.createdAt } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password').populate('likedSongs');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, createdAt: user.createdAt } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET CURRENT USER (me)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password').populate('likedSongs');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE PROFILE
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;
    const user = await User.findById(req.user.userId);
    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;
    await user.save();
    const io = getIo();
    io.to(`user-${req.user.userId}`).emit('profile-updated', {
      user: { id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture }
    });
    res.json({ user: { id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture, createdAt: user.createdAt } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CHANGE PASSWORD
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!(await user.comparePassword(currentPassword))) return res.status(401).json({ message: 'Wrong password' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE ACCOUNT
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LIKE / UNLIKE SONG (single, correct version)
router.post('/like-song', authenticateToken, async (req, res) => {
  try {
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ message: 'Song ID required' });

    const user = await User.findById(req.user.userId);
    const index = user.likedSongs.indexOf(songId);
    let liked = false;

    if (index === -1) {
      user.likedSongs.push(songId);
      liked = true;
    } else {
      user.likedSongs.splice(index, 1);
      liked = false;
    }
    await user.save();

    const io = getIo();
    io.to(`user-${req.user.userId}`).emit('liked-updated', { songId, liked });

    res.json({ liked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// GET LIKED SONGS
router.get('/liked-songs', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('likedSongs');
    res.json(user.likedSongs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;