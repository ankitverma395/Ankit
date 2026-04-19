import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MoreHorizontal, Plus, Share2, Heart, 
  Minimize2, Maximize2 
} from 'lucide-react';
import Comments from '../components/Comments';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

const PlayerView = () => {
  const { songId } = useParams();
  const { currentSong, queue, playSong, isPlaying } = usePlayer();

  const [showAddModal, setShowAddModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Find the current song
  const song = useMemo(() => {
    return queue.find(s => s.youtubeId === songId) || 
           (currentSong?.youtubeId === songId ? currentSong : null);
  }, [songId, queue, currentSong]);

  // Auto-play when component mounts
  useEffect(() => {
    if (song && (!currentSong || currentSong.youtubeId !== song.youtubeId)) {
      playSong(song, queue);
    }
  }, [song, currentSong, playSong, queue]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!song) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500 font-bold tracking-widest text-[10px] uppercase">Loading track...</p>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black overflow-y-auto hidden md:block"
    >
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 via-black to-black" />
        <motion.div
          animate={{
            scale: isPlaying ? [1, 1.2, 1] : 1,
            opacity: isPlaying ? [0.4, 0.6, 0.4] : 0.3,
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-purple-600/30 blur-[150px] rounded-full"
        />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-4xl mx-auto px-5 py-10 flex flex-col min-h-screen relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-full glass-card border-white/10 hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </motion.button>

          <div className="text-center">
            <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Now Playing</p>
            <h2 className="text-xs font-bold text-white/80 truncate max-w-[150px]">
              {song.artist || 'Unknown Artist'}
            </h2>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={toggleFullscreen}
              className="w-12 h-12 flex items-center justify-center rounded-full glass-card border-white/10 hover:bg-white/10 transition-all"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded-full glass-card border-white/10 hover:bg-white/10 transition-all">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Album Art */}
        <div className="flex justify-center mb-12 relative group">
          <motion.div
            animate={{
              rotate: isPlaying ? [0, 2, -2, 0] : 0,
              scale: isPlaying ? 1.02 : 1,
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-pink-500/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <img
              src={song.thumbnail}
              alt={song.title}
              className="relative w-96 h-96 rounded-3xl shadow-2xl object-cover border-2 border-white/10"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>

        {/* Song Info */}
        <div className="text-center space-y-2 mb-8">
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-black tracking-tight leading-tight px-2"
          >
            {song.title}
          </motion.h1>
          <p className="text-purple-400 text-lg font-semibold">
            {song.artist}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-8 pb-8">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="text-gray-400 hover:text-pink-500 transition-all transform hover:scale-110"
          >
            <Heart size={26} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-pink-500" : ""} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-full glass-card border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 font-bold text-sm"
          >
            <Plus size={18} /> Add to Playlist
          </button>
          <button className="text-gray-400 hover:text-blue-400 transition-all transform hover:scale-110">
            <Share2 size={24} />
          </button>
        </div>

        {/* Comments Section */}
        <div className="flex-1 mt-4 border-t border-white/10 pt-8">
          <div className="flex items-center gap-2 mb-5">
            <h3 className="font-black italic text-xl uppercase tracking-tighter">Community</h3>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-purple-500/50 to-transparent" />
          </div>
          <Comments songId={song.youtubeId} />
        </div>
      </div>

      {/* Add to playlist modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddToPlaylistModal
            song={song}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlayerView;