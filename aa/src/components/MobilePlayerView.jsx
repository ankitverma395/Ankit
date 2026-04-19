import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward,
  Heart, Plus, Share2, Volume2, VolumeX, ListMusic
} from 'lucide-react';
import AddToPlaylistModal from './AddToPlaylistModal';

const MobilePlayerView = () => {
  const { songId } = useParams();
  const navigate = useNavigate();

  const {
    currentSong,
    queue,
    playSong,
    isPlaying,
    togglePlay,
    nextSong,
    previousSong,
    progress,
    duration,
    seekTo,
    volume,
    changeVolume,
    toggleMute
  } = usePlayer();

  const [showAddModal, setShowAddModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [seek, setSeek] = useState(0);
  const progressBarRef = useRef(null);

  const hasPlayedRef = useRef(false); // ✅ FIX IMPORTANT

  const song = useMemo(() => {
    return queue.find(s => s.youtubeId === songId) ||
      (currentSong?.youtubeId === songId ? currentSong : null);
  }, [songId, queue, currentSong]);

  // ------------------ FIX: NO RELOAD LOOP ------------------
  useEffect(() => {
    if (!song) return;

    // ❌ STOP REPEATED playSong calls
    if (hasPlayedRef.current && currentSong?.youtubeId === song.youtubeId) {
      return;
    }

    if (!currentSong || currentSong.youtubeId !== song.youtubeId) {
      playSong(song, queue);
      hasPlayedRef.current = true;
    }
  }, [songId]); // 🔥 IMPORTANT: only songId dependency

  useEffect(() => {
    setSeek(progress);
  }, [progress]);

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    setSeek(newTime);
    seekTo(newTime);
  };

  const percent = duration ? (seek / duration) * 100 : 0;

  if (!song) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black overflow-hidden"
    >
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-black to-black" />
        <motion.div
          animate={{
            scale: isPlaying ? [1, 1.1, 1] : 1,
            opacity: isPlaying ? [0.3, 0.5, 0.3] : 0.2,
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2 bg-purple-600/20 blur-[120px] rounded-full"
        />
      </div>

      <div className="flex flex-col h-full overflow-y-auto px-5 py-6 relative z-10 pb-32">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5">
            <ArrowLeft size={22} />
          </button>
          <button className="p-2 rounded-full bg-white/5">
            <ListMusic size={22} />
          </button>
        </div>

        {/* Album */}
        <div className="flex justify-center mb-8">
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-64 h-64 rounded-2xl shadow-2xl object-cover border border-white/10"
          />
        </div>

        {/* Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">{song.title}</h1>
          <p className="text-purple-400 text-sm">{song.artist}</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div
            ref={progressBarRef}
            onClick={handleSeek}
            className="h-1.5 bg-white/10 rounded-full cursor-pointer"
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(seek)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <button onClick={previousSong}>
            <SkipBack size={28} className="text-white" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause size={28} className="text-black" />
            ) : (
              <Play size={28} className="text-black" />
            )}
          </button>

          <button onClick={nextSong}>
            <SkipForward size={28} className="text-white" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4">
          <button onClick={() => setIsLiked(!isLiked)}>
            <Heart className={isLiked ? "text-pink-500 fill-pink-500" : "text-gray-400"} />
          </button>

          <button onClick={() => setShowAddModal(true)}>
            <Plus className="text-gray-400" />
          </button>

          <button>
            <Share2 className="text-gray-400" />
          </button>

          <button onClick={toggleMute}>
            {volume === 0 ? (
              <VolumeX className="text-gray-400" />
            ) : (
              <Volume2 className="text-gray-400" />
            )}
          </button>
        </div>

      </div>

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

export default MobilePlayerView;