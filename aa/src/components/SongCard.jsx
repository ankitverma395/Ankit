import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, Plus, Music, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import AddToPlaylistModal from './AddToPlaylistModal';

const SongCard = ({ song, index, allSongs = [] }) => {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { token, user, refreshUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  // Derived state: Is this card currently playing?
  const isCurrentlyPlaying = useMemo(() => 
    currentSong?.youtubeId === song.youtubeId, 
  [currentSong, song.youtubeId]);

  useEffect(() => {
    if (user?.likedSongs && song.youtubeId) {
      const liked = user.likedSongs.some(ls => ls.youtubeId === song.youtubeId);
      setIsLiked(liked);
    }
  }, [user, song.youtubeId]);

  const handlePlay = (e) => {
    e.stopPropagation();
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
    if (liking || !token) return;
    setLiking(true);

    try {
      let songId = song._id;
      if (!songId) {
        const saveRes = await axios.post(`${import.meta.env.VITE_API_URL}/songs`,
          { ...song },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        songId = saveRes.data._id;
        song._id = songId;
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/like-song`,
        { songId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsLiked(res.data.liked);
      refreshUser(); // Keep the auth context in sync
    } catch (err) {
      console.error('Like failed', err);
    } finally {
      setLiking(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, type: 'spring', stiffness: 260, damping: 20 }}
        className="group relative"
      >
        <div className={`glass-card p-3 border transition-all duration-500 ${
          isCurrentlyPlaying 
            ? 'border-purple-500/50 bg-purple-500/5' 
            : 'border-white/5 hover:border-white/20'
        }`}>
          {/* Thumbnail Container */}
          <div className="relative aspect-square mb-4 overflow-hidden rounded-xl shadow-2xl">
            <img
              src={song.thumbnail}
              alt={song.title}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                isCurrentlyPlaying && isPlaying ? 'animate-pulse-slow' : ''
              }`}
            />
            
            {/* Active Playing Overlay */}
            {isCurrentlyPlaying && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-purple-600 text-[10px] font-black uppercase tracking-tighter shadow-lg flex items-center gap-1.5 z-10">
                <Sparkles size={10} /> Now Playing
              </div>
            )}

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlay} 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black shadow-xl"
              >
                {isCurrentlyPlaying && isPlaying ? <Music size={20} className="animate-bounce" /> : <Play size={20} fill="black" className="ml-1" />}
              </motion.button>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleLike} 
                  className={`p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all ${
                    isLiked ? 'bg-pink-500 text-white border-pink-400' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }} 
                  className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Song Metadata */}
          <div className="space-y-1 px-1">
            <h3 className={`font-bold text-sm truncate tracking-tight transition-colors ${
              isCurrentlyPlaying ? 'text-purple-400' : 'text-white'
            }`}>
              {song.title}
            </h3>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 truncate">
              {song.artist}
            </p>
          </div>
        </div>

        {/* Floating Shadow/Glow Effect on Hover */}
        <div className="absolute -inset-2 bg-gradient-to-tr from-purple-600/20 to-pink-600/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
      </motion.div>

      {showAddModal && (
        <AddToPlaylistModal song={song} onClose={() => setShowAddModal(false)} />
      )}
    </>
  );
};

export default SongCard;