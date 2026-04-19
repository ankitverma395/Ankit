import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import SongCard from '../components/SongCard';
import { Heart, Play, Shuffle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LikedSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token, user } = useAuth();
  const { playSong, setIsShuffle } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    const fetchLikedSongs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/liked-songs`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal
          }
        );
        setSongs(res.data || []);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error('Error fetching favorites:', err);
          setError('Failed to load liked songs');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLikedSongs();
    return () => controller.abort();
  }, [token]);

  const handlePlayAll = useCallback((shuffle = false) => {
    if (!songs.length) return;

    const queue = shuffle
      ? [...songs].sort(() => Math.random() - 0.5)
      : songs;

    setIsShuffle(shuffle);
    playSong(queue[0], queue);
  }, [songs, playSong, setIsShuffle]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="w-full h-32 bg-white/10 rounded-xl mb-4" />
            <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-red-500 font-bold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-white/10 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-32 pt-4 px-4 md:px-0">

      {/* 🎬 Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] mb-10 p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-700 to-indigo-900" />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-2xl" />

        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-4">
          
          {/* ❤️ Smaller Cover */}
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-pink-400 to-pink-600 rounded-[1.5rem] shadow-xl flex items-center justify-center"
          >
            <Heart size={48} fill="white" />
          </motion.div>

          {/* 📄 Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-200">
              Personal Collection
            </p>

            <h1 className="text-4xl md:text-6xl font-black italic text-white leading-none">
              LIKED <br /> SONGS
            </h1>

            <div className="flex items-center justify-center md:justify-start gap-2 text-pink-100/70 font-bold">
              <span className="bg-white/10 px-2 py-1 rounded-full text-xs">
                {user?.username || 'User'}
              </span>
              <span>•</span>
              <span className="text-xs">{songs.length} Tracks</span>
            </div>

            <div className="flex flex-wrap gap-3 pt-3 justify-center md:justify-start">
              <button 
                onClick={() => handlePlayAll(false)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:scale-105 transition"
              >
                <Play size={18} fill="black" /> PLAY
              </button>

              <button 
                onClick={() => handlePlayAll(true)}
                className="flex items-center gap-2 px-6 py-3 bg-pink-500/20 text-white border border-pink-500/30 rounded-xl font-bold hover:bg-pink-500/40 transition"
              >
                <Shuffle size={18} /> SHUFFLE
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🎧 Empty State */}
      {songs.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card py-20 text-center rounded-[2rem]"
        >
          <Heart size={36} className="mx-auto text-pink-500 mb-4" />
          <h2 className="text-xl font-bold">No liked songs yet</h2>
          <p className="text-gray-500 mt-2">Start exploring music 🎵</p>

          <button 
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2 bg-white/10 rounded-full"
          >
            Browse Songs
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
          <AnimatePresence>
            {songs.map((song, idx) => (
              <motion.div
                key={song._id || song.youtubeId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.02 }}
                layout
              >
                <SongCard song={song} index={idx} allSongs={songs} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default LikedSongs;