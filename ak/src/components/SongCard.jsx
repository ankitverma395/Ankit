// frontend/src/components/SongCard.jsx
import { motion } from 'framer-motion';
import { Play, Heart, Plus } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AddToPlaylistModal from './AddToPlaylistModal';

const SongCard = ({ song, index, allSongs = [] }) => {
  const { playSong } = usePlayer();
  const { token, user, refreshUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  // Check if song is already liked (using youtubeId as fallback comparison)
  useEffect(() => {
    if (user?.likedSongs && song.youtubeId) {
      // Check if any liked song has matching youtubeId
      const liked = user.likedSongs.some(likedSong => likedSong.youtubeId === song.youtubeId);
      setIsLiked(liked);
    }
  }, [user, song.youtubeId]);

  const handlePlay = () => {
    if (allSongs.length > 0) {
      const startIndex = allSongs.findIndex(s => s.youtubeId === song.youtubeId);
      const orderedQueue = [...allSongs.slice(startIndex), ...allSongs.slice(0, startIndex)];
      playSong(song, orderedQueue);
    } else {
      playSong(song, [song]);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liking) return;
    setLiking(true);

    try {
      // Step 1: Ensure song exists in DB (get MongoDB _id)
      let songId = song._id;
      if (!songId) {
        // Save song to database first
        const saveRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/songs`,
          {
            youtubeId: song.youtubeId,
            title: song.title,
            artist: song.artist,
            thumbnail: song.thumbnail,
            duration: song.duration || ''
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        songId = saveRes.data._id;
        // Update the song object for future use
        song._id = songId;
      }

      // Step 2: Toggle like
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/like-song`,
        { songId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiked(res.data.liked);

      // Step 3: Refresh user data to update likedSongs array
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshUser(userRes.data.user);
    } catch (err) {
      console.error('Like error:', err.response?.data || err.message);
      alert(`Like failed: ${err.response?.data?.message || 'Please try again'}`);
    } finally {
      setLiking(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: (index || 0) * 0.05 }}
        className="glass-card group cursor-pointer p-4 hover:scale-105 transition-transform"
      >
        <div className="relative">
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-full aspect-square rounded-lg object-cover mb-3"
          />
          <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={handlePlay} className="player-btn-primary p-2">
              <Play size={20} className="ml-0.5" />
            </button>
            <button onClick={handleLike} disabled={liking} className="player-btn bg-white/10 p-2">
              <Heart size={20} className={isLiked ? 'fill-red-500 text-red-500' : 'text-white'} />
            </button>
            <button onClick={() => setShowAddModal(true)} className="player-btn bg-white/10 p-2">
              <Plus size={20} />
            </button>
          </div>
        </div>
        <h3 className="font-semibold truncate">{song.title}</h3>
        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
      </motion.div>

      {showAddModal && (
        <AddToPlaylistModal song={song} onClose={() => setShowAddModal(false)} />
      )}
    </>
  );
};

export default SongCard;